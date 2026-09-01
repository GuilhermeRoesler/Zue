import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import { FilePicker } from '@capawesome/capacitor-file-picker';
import type { CatalogCollection, CatalogSlide } from '@/data/catalog-slides';
import {
  clearDriveFolderSelection,
  restoreDriveFolderFromCache,
  syncAndLoadDriveFolder,
  type DriveSyncProgress,
} from '@/lib/google-drive';
import { releaseAllMediaUrls } from '@/lib/media-blob-cache';
import {
  collectionsFromMediaGroups,
  isMediaFilename,
  type MediaCollectionGroup,
  type MediaFileEntry,
  type MediaSort,
} from '@/lib/media-types';
import SafDirectory from '@/lib/saf-directory';

export type { DriveSyncProgress };

const PREF_FOLDER_PATH = 'zue.mediaFolderPath';
const PREF_FOLDER_LABEL = 'zue.mediaFolderLabel';
const PREF_MEDIA_SORT = 'zue.mediaSort';
const PREF_MEDIA_SOURCE = 'zue.mediaSource';
const IDB_NAME = 'zue-media';
const IDB_STORE = 'handles';
const IDB_KEY = 'directory';

export type MediaSourceKind = 'demo' | 'folder' | 'drive';

export type { MediaSort };

export interface MediaFolderState {
  kind: MediaSourceKind;
  label: string | null;
  slides: CatalogSlide[];
  collections: CatalogCollection[];
  sort: MediaSort;
  /** Só para fonte Drive: timestamp do último sync bem-sucedido. */
  syncedAt?: number | null;
}

function isNative(): boolean {
  return Capacitor.isNativePlatform();
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

async function setActiveMediaSource(
  source: 'folder' | 'drive'
): Promise<void> {
  await Preferences.set({ key: PREF_MEDIA_SOURCE, value: source });
}

export async function getActiveMediaSource(): Promise<'folder' | 'drive' | null> {
  const { value } = await Preferences.get({ key: PREF_MEDIA_SOURCE });
  if (value === 'folder' || value === 'drive') return value;
  // Legado: pasta local sem flag explícita.
  const { value: path } = await Preferences.get({ key: PREF_FOLDER_PATH });
  const { value: label } = await Preferences.get({ key: PREF_FOLDER_LABEL });
  if (path || label) return 'folder';
  return null;
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

// —— Native (Android): Capawesome pickDirectory + SafDirectory (SAF) ——

async function scanNativeDirectoryFlat(path: string): Promise<MediaFileEntry[]> {
  const { files } = await SafDirectory.readdir({ path });
  const entries: MediaFileEntry[] = [];

  for (const file of files) {
    const name = file.name;
    if (file.type === 'directory' || !isMediaFilename(name)) continue;

    entries.push({
      name,
      src: Capacitor.convertFileSrc(file.uri),
      lastModified: file.mtime ?? undefined,
    });
  }

  return entries;
}

async function scanNativeDirectoryTree(
  path: string,
  rootTitle: string
): Promise<MediaCollectionGroup[]> {
  const { files } = await SafDirectory.readdir({ path });
  const rootEntries: MediaFileEntry[] = [];
  const subdirs: { name: string; path: string }[] = [];

  for (const file of files) {
    const name = file.name;
    if (file.type === 'directory') {
      subdirs.push({ name, path: file.uri });
      continue;
    }
    if (!isMediaFilename(name)) continue;

    rootEntries.push({
      name,
      src: Capacitor.convertFileSrc(file.uri),
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

  // Capawesome concede flags no Intent, mas não chama takePersistableUriPermission.
  await SafDirectory.takePersistablePermission({ path });

  let label: string;
  try {
    ({ name: label } = await SafDirectory.getDisplayName({ path }));
  } catch {
    label = path.split(/[/\\:]/).filter(Boolean).pop() ?? path;
  }

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
  await setActiveMediaSource('folder');
  return buildState(result.label, result.groups, sort);
}

/**
 * Conecta pasta remota do Drive: baixa para cache local e exibe.
 * Substitui a fonte ativa (pasta local permanece salva, mas inativa).
 */
export async function pickDriveFolder(
  folderId: string,
  label: string,
  onProgress?: (progress: DriveSyncProgress) => void
): Promise<MediaFolderState> {
  const sort = await getMediaSort();
  const state = await syncAndLoadDriveFolder(sort, {
    folderId,
    label,
    onProgress,
  });
  await setActiveMediaSource('drive');
  return {
    kind: 'drive',
    label: state.label,
    slides: state.slides,
    collections: state.collections,
    sort: state.sort,
    syncedAt: state.syncedAt,
  };
}

async function restoreLocalFolder(): Promise<MediaFolderState | null> {
  const sort = await getMediaSort();
  const result = isNative()
    ? await restoreNativeDirectory()
    : await restoreWebDirectory();

  if (!result || result.groups.every((g) => g.entries.length === 0)) {
    return null;
  }

  releaseAllMediaUrls();
  return buildState(result.label, result.groups, sort);
}

/**
 * Restaura a fonte ativa: Drive (sync no boot + fallback cache) ou pasta local.
 */
export async function restoreMediaFolder(options?: {
  onDriveProgress?: (progress: DriveSyncProgress) => void;
}): Promise<MediaFolderState | null> {
  try {
    const sort = await getMediaSort();
    const active = await getActiveMediaSource();

    if (active === 'drive') {
      try {
        const synced = await syncAndLoadDriveFolder(sort, {
          onProgress: options?.onDriveProgress,
        });
        return {
          kind: 'drive',
          label: synced.label,
          slides: synced.slides,
          collections: synced.collections,
          sort: synced.sort,
          syncedAt: synced.syncedAt,
        };
      } catch (error) {
        console.warn('[media-folder] drive sync:', error);
        const cached = await restoreDriveFolderFromCache(sort);
        if (cached) {
          return {
            kind: 'drive',
            label: cached.label,
            slides: cached.slides,
            collections: cached.collections,
            sort: cached.sort,
            syncedAt: cached.syncedAt,
          };
        }
        throw error;
      }
    }

    return restoreLocalFolder();
  } catch (error) {
    console.warn('[media-folder] restore:', error);
    return null;
  }
}

/** Reaplica sort na fonte já vinculada (re-scan / re-leitura do cache). */
export async function refreshMediaFolderWithSort(
  sort: MediaSort
): Promise<MediaFolderState | null> {
  await setMediaSort(sort);
  const active = await getActiveMediaSource();
  if (active === 'drive') {
    const cached = await restoreDriveFolderFromCache(sort);
    if (!cached) return null;
    return {
      kind: 'drive',
      label: cached.label,
      slides: cached.slides,
      collections: cached.collections,
      sort: cached.sort,
      syncedAt: cached.syncedAt,
    };
  }
  return restoreLocalFolder();
}

/** Remove pasta local, vínculo Drive e volta ao catálogo demo. */
export async function clearMediaFolder(): Promise<void> {
  releaseAllMediaUrls();
  await Preferences.remove({ key: PREF_FOLDER_PATH });
  await Preferences.remove({ key: PREF_FOLDER_LABEL });
  await Preferences.remove({ key: PREF_MEDIA_SOURCE });
  await clearDriveFolderSelection();
  if (!isNative()) {
    try {
      await clearDirectoryHandle();
    } catch {
      /* ignore */
    }
  }
}

/** Remove vínculo Drive (cache + pasta) e desativa fonte se estiver ativa. */
export async function clearDriveMediaSource(): Promise<void> {
  await clearDriveFolderSelection();
  const active = await getActiveMediaSource();
  if (active === 'drive') {
    await Preferences.remove({ key: PREF_MEDIA_SOURCE });
  }
}

