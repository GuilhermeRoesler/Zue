import { Capacitor } from '@capacitor/core';
import { Filesystem } from '@capacitor/filesystem';
import { Preferences } from '@capacitor/preferences';
import { FilePicker } from '@capawesome/capacitor-file-picker';
import type { CatalogSlide } from '@/data/catalog-slides';
import {
  isMediaFilename,
  slidesFromMediaEntries,
  type MediaFileEntry,
} from '@/lib/media-types';

const PREF_FOLDER_PATH = 'zue.mediaFolderPath';
const PREF_FOLDER_LABEL = 'zue.mediaFolderLabel';
const IDB_NAME = 'zue-media';
const IDB_STORE = 'handles';
const IDB_KEY = 'directory';

export type MediaSourceKind = 'demo' | 'folder';

export interface MediaFolderState {
  kind: MediaSourceKind;
  label: string | null;
  slides: CatalogSlide[];
}

function isNative(): boolean {
  return Capacitor.isNativePlatform();
}

function joinPath(dir: string, name: string): string {
  if (dir.endsWith('/')) return `${dir}${name}`;
  return `${dir}/${name}`;
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

async function scanWebDirectory(
  handle: ZueFileSystemDirectoryHandle
): Promise<MediaFileEntry[]> {
  const entries: MediaFileEntry[] = [];

  for await (const [name, entry] of handle.entries()) {
    if (entry.kind !== 'file' || !isMediaFilename(name)) continue;
    const file = await entry.getFile();
    entries.push({
      name,
      src: URL.createObjectURL(file),
    });
  }

  return entries;
}

async function pickWebDirectory(): Promise<{
  label: string;
  entries: MediaFileEntry[];
}> {
  if (typeof window.showDirectoryPicker !== 'function') {
    throw new Error(
      'Seu navegador não permite escolher pasta. Use Chrome/Edge ou o app Android.'
    );
  }

  const handle = await window.showDirectoryPicker({ mode: 'read' });
  await saveDirectoryHandle(handle);
  await Preferences.set({ key: PREF_FOLDER_LABEL, value: handle.name });

  const entries = await scanWebDirectory(handle);
  return { label: handle.name, entries };
}

async function restoreWebDirectory(): Promise<{
  label: string;
  entries: MediaFileEntry[];
} | null> {
  const handle = await loadDirectoryHandle();
  if (!handle) return null;

  const ok = await ensureDirectoryPermission(handle);
  if (!ok) return null;

  const entries = await scanWebDirectory(handle);
  return { label: handle.name, entries };
}

// —— Native (Android): Capawesome pickDirectory + Filesystem ——

async function scanNativeDirectory(path: string): Promise<MediaFileEntry[]> {
  const { files } = await Filesystem.readdir({ path });
  const entries: MediaFileEntry[] = [];

  for (const file of files) {
    const name = file.name;
    if (file.type === 'directory' || !isMediaFilename(name)) continue;

    const absolute = file.uri ?? joinPath(path, name);
    entries.push({
      name,
      src: Capacitor.convertFileSrc(absolute),
    });
  }

  return entries;
}

async function pickNativeDirectory(): Promise<{
  label: string;
  entries: MediaFileEntry[];
  path: string;
}> {
  const { path } = await FilePicker.pickDirectory();
  if (!path) {
    throw new Error('Nenhuma pasta selecionada.');
  }

  const label = path.split(/[/\\]/).filter(Boolean).pop() ?? path;
  await Preferences.set({ key: PREF_FOLDER_PATH, value: path });
  await Preferences.set({ key: PREF_FOLDER_LABEL, value: label });

  const entries = await scanNativeDirectory(path);
  return { label, entries, path };
}

async function restoreNativeDirectory(): Promise<{
  label: string;
  entries: MediaFileEntry[];
} | null> {
  const { value: path } = await Preferences.get({ key: PREF_FOLDER_PATH });
  if (!path) return null;

  const { value: label } = await Preferences.get({ key: PREF_FOLDER_LABEL });

  try {
    const entries = await scanNativeDirectory(path);
    return { label: label ?? path, entries };
  } catch (error) {
    console.warn('[media-folder] Falha ao ler pasta salva:', error);
    return null;
  }
}

// —— API pública ——

/** Escolhe pasta (web: File System Access; Android: SAF via Capawesome). */
export async function pickMediaFolder(): Promise<MediaFolderState> {
  const result = isNative()
    ? await pickNativeDirectory()
    : await pickWebDirectory();

  const slides = slidesFromMediaEntries(result.entries);
  if (slides.length === 0) {
    throw new Error(
      'A pasta não contém imagens ou vídeos suportados (jpg, png, webp, mp4, webm…).'
    );
  }

  return {
    kind: 'folder',
    label: result.label,
    slides,
  };
}

/** Restaura pasta salva ou retorna null (usar demo). */
export async function restoreMediaFolder(): Promise<MediaFolderState | null> {
  try {
    const result = isNative()
      ? await restoreNativeDirectory()
      : await restoreWebDirectory();

    if (!result || result.entries.length === 0) return null;

    return {
      kind: 'folder',
      label: result.label,
      slides: slidesFromMediaEntries(result.entries),
    };
  } catch (error) {
    console.warn('[media-folder] restore:', error);
    return null;
  }
}

/** Remove pasta vinculada e volta ao catálogo demo. */
export async function clearMediaFolder(): Promise<void> {
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
