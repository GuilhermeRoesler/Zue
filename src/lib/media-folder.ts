import { Capacitor } from '@capacitor/core';
import { Filesystem } from '@capacitor/filesystem';
import { Preferences } from '@capacitor/preferences';
import { FilePicker } from '@capawesome/capacitor-file-picker';
import type { CatalogCollection, CatalogSlide } from '@/data/catalog-slides';
import { releaseAllMediaUrls } from '@/lib/media-blob-cache';
import {
  collectionsFromMediaGroups,
  isMediaFilename,
  type MediaCollectionGroup,
  type MediaFileEntry,
  type MediaSort,
} from '@/lib/media-types';

const PREF_FOLDER_PATH = 'zue.mediaFolderPath';
const PREF_FOLDER_LABEL = 'zue.mediaFolderLabel';
const PREF_MEDIA_SORT = 'zue.mediaSort';
const IDB_NAME = 'zue-media';
const IDB_STORE = 'handles';
const IDB_KEY = 'directory';

export type MediaSourceKind = 'demo' | 'folder';

export type { MediaSort };

export interface MediaFolderState {
  kind: MediaSourceKind;
  label: string | null;
  slides: CatalogSlide[];
  collections: CatalogCollection[];
  sort: MediaSort;
}

function isNative(): boolean {
  return Capacitor.isNativePlatform();
}

function joinPath(dir: string, name: string): string {
  if (dir.endsWith('/')) return `${dir}${name}`;
  return `${dir}/${name}`;
}

function slugify(name: string): string {
  return (
    name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'colecao'
  );
}

export async function getMediaSort(): Promise<MediaSort> {
  const { value } = await Preferences.get({ key: PREF_MEDIA_SORT });
  return value === 'date' ? 'date' : 'name';
}

export async function setMediaSort(sort: MediaSort): Promise<void> {
  await Preferences.set({ key: PREF_MEDIA_SORT, value: sort });
}

function flattenSlides(collections: CatalogCollection[]): CatalogSlide[] {
  return collections.flatMap((c) => c.slides);
}

function buildState(
  label: string,
  groups: MediaCollectionGroup[],
  sort: MediaSort
): MediaFolderState {
  const collections = collectionsFromMediaGroups(groups, sort);
  return {
    kind: 'folder',
    label,
    collections,
    slides: flattenSlides(collections),
    sort,
  };
}

// —— IndexedDB (web: persistência do FileSystemDirectoryHandle) ——

function openIdb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function saveDirectoryHandle(handle: ZueFileSystemDirectoryHandle): Promise<void> {
  const db = await openIdb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readwrite');
    tx.objectStore(IDB_STORE).put(handle, IDB_KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

async function loadDirectoryHandle(): Promise<ZueFileSystemDirectoryHandle | null> {
  const db = await openIdb();
  const handle = await new Promise<ZueFileSystemDirectoryHandle | null>((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readonly');
    const req = tx.objectStore(IDB_STORE).get(IDB_KEY);
    req.onsuccess = () =>
      resolve((req.result as ZueFileSystemDirectoryHandle) ?? null);
    req.onerror = () => reject(req.error);
  });
  db.close();
  return handle;
}

async function clearDirectoryHandle(): Promise<void> {
  const db = await openIdb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readwrite');
    tx.objectStore(IDB_STORE).delete(IDB_KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

async function ensureDirectoryPermission(
  handle: ZueFileSystemDirectoryHandle
): Promise<boolean> {
  const opts: FileSystemHandlePermissionDescriptor = { mode: 'read' };
  if ((await handle.queryPermission(opts)) === 'granted') return true;
  if ((await handle.requestPermission(opts)) === 'granted') return true;
  return false;
}

async function scanWebDirectoryFlat(
  handle: ZueFileSystemDirectoryHandle
): Promise<MediaFileEntry[]> {
  const entries: MediaFileEntry[] = [];

  for await (const [name, entry] of handle.entries()) {
    if (entry.kind !== 'file' || !isMediaFilename(name)) continue;
    const file = await entry.getFile();
    entries.push({
      name,
      src: '',
      file,
      lastModified: file.lastModified,
    });
  }

  return entries;
}

/** Raiz + subpastas (1 nível) → grupos de coleção. */
async function scanWebDirectoryTree(
  handle: ZueFileSystemDirectoryHandle,
  rootTitle: string
): Promise<MediaCollectionGroup[]> {
  const rootEntries: MediaFileEntry[] = [];
  const subdirs: { name: string; handle: ZueFileSystemDirectoryHandle }[] = [];

  for await (const [name, entry] of handle.entries()) {
    if (entry.kind === 'directory') {
      subdirs.push({ name, handle: entry });
      continue;
    }
    if (entry.kind !== 'file' || !isMediaFilename(name)) continue;
    const file = await entry.getFile();
    rootEntries.push({
      name,
      src: '',
      file,
      lastModified: file.lastModified,
    });
  }

  subdirs.sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
  );

  const groups: MediaCollectionGroup[] = [];

  if (rootEntries.length > 0) {
    groups.push({
      id: 'vitrine',
      title: rootTitle,
      entries: rootEntries,
    });
  }

  for (const sub of subdirs) {
    const entries = await scanWebDirectoryFlat(sub.handle);
    if (entries.length === 0) continue;
    groups.push({
      id: `folder-${slugify(sub.name)}`,
      title: sub.name,
      entries,
    });
  }

  return groups;
}

async function pickWebDirectory(): Promise<{
  label: string;
  groups: MediaCollectionGroup[];
}> {
  if (typeof window.showDirectoryPicker !== 'function') {
    throw new Error(
      'Seu navegador não permite escolher pasta. Use Chrome/Edge ou o app Android.'
    );
  }

  const handle = await window.showDirectoryPicker({ mode: 'read' });
  await saveDirectoryHandle(handle);
  await Preferences.set({ key: PREF_FOLDER_LABEL, value: handle.name });

  const groups = await scanWebDirectoryTree(handle, handle.name);
  return { label: handle.name, groups };
}

async function restoreWebDirectory(): Promise<{
  label: string;
  groups: MediaCollectionGroup[];
} | null> {
  const handle = await loadDirectoryHandle();
  if (!handle) return null;

  const ok = await ensureDirectoryPermission(handle);
  if (!ok) return null;

  const groups = await scanWebDirectoryTree(handle, handle.name);
  return { label: handle.name, groups };
}

// —— Native (Android): Capawesome pickDirectory + Filesystem ——

async function scanNativeDirectoryFlat(path: string): Promise<MediaFileEntry[]> {
  const { files } = await Filesystem.readdir({ path });
  const entries: MediaFileEntry[] = [];

  for (const file of files) {
    const name = file.name;
    if (file.type === 'directory' || !isMediaFilename(name)) continue;

    const absolute = file.uri ?? joinPath(path, name);
    entries.push({
      name,
      src: Capacitor.convertFileSrc(absolute),
      lastModified: file.mtime ?? undefined,
    });
  }

  return entries;
}

async function scanNativeDirectoryTree(
  path: string,
  rootTitle: string
): Promise<MediaCollectionGroup[]> {
  const { files } = await Filesystem.readdir({ path });
  const rootEntries: MediaFileEntry[] = [];
  const subdirs: { name: string; path: string }[] = [];

  for (const file of files) {
    const name = file.name;
    if (file.type === 'directory') {
      subdirs.push({ name, path: file.uri ?? joinPath(path, name) });
      continue;
    }
    if (!isMediaFilename(name)) continue;

    const absolute = file.uri ?? joinPath(path, name);
    rootEntries.push({
      name,
      src: Capacitor.convertFileSrc(absolute),
      lastModified: file.mtime ?? undefined,
    });
  }

  subdirs.sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
  );

  const groups: MediaCollectionGroup[] = [];

  if (rootEntries.length > 0) {
    groups.push({
      id: 'vitrine',
      title: rootTitle,
      entries: rootEntries,
    });
  }

  for (const sub of subdirs) {
    const entries = await scanNativeDirectoryFlat(sub.path);
    if (entries.length === 0) continue;
    groups.push({
      id: `folder-${slugify(sub.name)}`,
      title: sub.name,
      entries,
    });
  }

  return groups;
}

async function pickNativeDirectory(): Promise<{
  label: string;
  groups: MediaCollectionGroup[];
  path: string;
}> {
  const { path } = await FilePicker.pickDirectory();
  if (!path) {
    throw new Error('Nenhuma pasta selecionada.');
  }

  const label = path.split(/[/\\]/).filter(Boolean).pop() ?? path;
  await Preferences.set({ key: PREF_FOLDER_PATH, value: path });
  await Preferences.set({ key: PREF_FOLDER_LABEL, value: label });

  const groups = await scanNativeDirectoryTree(path, label);
  return { label, groups, path };
}

async function restoreNativeDirectory(): Promise<{
  label: string;
  groups: MediaCollectionGroup[];
} | null> {
  const { value: path } = await Preferences.get({ key: PREF_FOLDER_PATH });
  if (!path) return null;

  const { value: label } = await Preferences.get({ key: PREF_FOLDER_LABEL });
  const rootTitle = label ?? path;

  try {
    const groups = await scanNativeDirectoryTree(path, rootTitle);
    return { label: rootTitle, groups };
  } catch (error) {
    console.warn('[media-folder] Falha ao ler pasta salva:', error);
    return null;
  }
}

// —— API pública ——

function assertHasMedia(groups: MediaCollectionGroup[]): void {
  const total = groups.reduce((n, g) => n + g.entries.length, 0);
  if (total === 0) {
    throw new Error(
      'A pasta não contém imagens ou vídeos suportados (jpg, png, webp, mp4, webm…).'
    );
  }
}

/** Escolhe pasta (web: File System Access; Android: SAF via Capawesome). */
export async function pickMediaFolder(): Promise<MediaFolderState> {
  releaseAllMediaUrls();
  const sort = await getMediaSort();
  const result = isNative()
    ? await pickNativeDirectory()
    : await pickWebDirectory();

  assertHasMedia(result.groups);
  return buildState(result.label, result.groups, sort);
}

/** Restaura pasta salva ou retorna null (usar demo). */
export async function restoreMediaFolder(): Promise<MediaFolderState | null> {
  try {
    const sort = await getMediaSort();
    const result = isNative()
      ? await restoreNativeDirectory()
      : await restoreWebDirectory();

    if (!result || result.groups.every((g) => g.entries.length === 0)) {
      return null;
    }

    releaseAllMediaUrls();
    return buildState(result.label, result.groups, sort);
  } catch (error) {
    console.warn('[media-folder] restore:', error);
    return null;
  }
}

/** Reaplica sort na pasta já vinculada (re-scan). */
export async function refreshMediaFolderWithSort(
  sort: MediaSort
): Promise<MediaFolderState | null> {
  await setMediaSort(sort);
  return restoreMediaFolder();
}

/** Remove pasta vinculada e volta ao catálogo demo. */
export async function clearMediaFolder(): Promise<void> {
  releaseAllMediaUrls();
  await Preferences.remove({ key: PREF_FOLDER_PATH });
  await Preferences.remove({ key: PREF_FOLDER_LABEL });
  if (!isNative()) {
    try {
      await clearDirectoryHandle();
    } catch {
      /* ignore */
    }
  }
}

export async function getSavedFolderLabel(): Promise<string | null> {
  const { value } = await Preferences.get({ key: PREF_FOLDER_LABEL });
  return value;
}
