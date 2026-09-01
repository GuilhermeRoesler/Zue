import { Capacitor } from '@capacitor/core';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { Preferences } from '@capacitor/preferences';
import {
  downloadDriveFileBlob,
  driveDownloadUrl,
  type DriveCollectionPlan,
  type DriveFileItem,
} from '@/lib/google-drive-api';
import { getValidAccessToken } from '@/lib/google-oauth';
import type { MediaCollectionGroup, MediaFileEntry } from '@/lib/media-types';

const PREF_DRIVE_META = 'zue.driveCacheMeta';
const CACHE_ROOT = 'zue-drive';
const IDB_NAME = 'zue-drive-cache';
const IDB_STORE = 'files';

/** Blob URLs criados na web — revogar ao remountar/limpar. */
const activeBlobUrls = new Set<string>();

export function releaseDriveBlobUrls(): void {
  for (const url of activeBlobUrls) {
    try {
      URL.revokeObjectURL(url);
    } catch {
      /* ignore */
    }
  }
  activeBlobUrls.clear();
}

export interface DriveCacheFileMeta {
  id: string;
  name: string;
  relativePath: string;
  modifiedTime?: string;
  md5Checksum?: string;
  /** Web: chave no IndexedDB. Native: path relativo sob CACHE_ROOT. */
  storageKey: string;
}

export interface DriveCacheMeta {
  folderId: string;
  label: string;
  syncedAt: number;
  files: DriveCacheFileMeta[];
  /** Grupos para remontar coleções sem reconsultar a API. */
  groups: { id: string; title: string; fileIds: string[] }[];
}

export interface DriveSyncProgress {
  phase: 'planning' | 'downloading' | 'done';
  current: number;
  total: number;
  fileName?: string;
}

function isNative(): boolean {
  return Capacitor.isNativePlatform();
}

function joinPath(...parts: string[]): string {
  return parts
    .filter(Boolean)
    .join('/')
    .replace(/\/{2,}/g, '/');
}

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

async function idbPut(key: string, blob: Blob): Promise<void> {
  const db = await openIdb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readwrite');
    tx.objectStore(IDB_STORE).put(blob, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

async function idbGet(key: string): Promise<Blob | null> {
  const db = await openIdb();
  const blob = await new Promise<Blob | null>((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readonly');
    const req = tx.objectStore(IDB_STORE).get(key);
    req.onsuccess = () => resolve((req.result as Blob) ?? null);
    req.onerror = () => reject(req.error);
  });
  db.close();
  return blob;
}

async function idbDeleteKeys(keys: string[]): Promise<void> {
  if (keys.length === 0) return;
  const db = await openIdb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readwrite');
    const store = tx.objectStore(IDB_STORE);
    for (const key of keys) store.delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

async function idbClear(): Promise<void> {
  const db = await openIdb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readwrite');
    tx.objectStore(IDB_STORE).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export async function loadDriveCacheMeta(): Promise<DriveCacheMeta | null> {
  const { value } = await Preferences.get({ key: PREF_DRIVE_META });
  if (!value) return null;
  try {
    return JSON.parse(value) as DriveCacheMeta;
  } catch {
    return null;
  }
}

async function saveDriveCacheMeta(meta: DriveCacheMeta): Promise<void> {
  await Preferences.set({ key: PREF_DRIVE_META, value: JSON.stringify(meta) });
}

export async function clearDriveCache(): Promise<void> {
  releaseDriveBlobUrls();
  await Preferences.remove({ key: PREF_DRIVE_META });
  if (isNative()) {
    try {
      await Filesystem.rmdir({
        path: CACHE_ROOT,
        directory: Directory.Data,
        recursive: true,
      });
    } catch {
      /* pasta pode não existir */
    }
  } else {
    try {
      await idbClear();
    } catch {
      /* ignore */
    }
  }
}

function fileFingerprint(file: DriveFileItem): string {
  return `${file.md5Checksum ?? ''}|${file.modifiedTime ?? ''}|${file.size ?? ''}`;
}

function needsDownload(
  file: DriveFileItem,
  existing: DriveCacheFileMeta | undefined
): boolean {
  if (!existing) return true;
  if (file.md5Checksum && existing.md5Checksum) {
    return file.md5Checksum !== existing.md5Checksum;
  }
  return file.modifiedTime !== existing.modifiedTime;
}

async function ensureNativeDir(relativeDir: string): Promise<void> {
  const path = joinPath(CACHE_ROOT, relativeDir);
  try {
    await Filesystem.mkdir({
      path,
      directory: Directory.Data,
      recursive: true,
    });
  } catch {
    /* already exists */
  }
}

async function downloadToNative(
  file: DriveFileItem,
  relativePath: string
): Promise<string> {
  const dir = relativePath.includes('/')
    ? relativePath.slice(0, relativePath.lastIndexOf('/'))
    : '';
  await ensureNativeDir(dir);

  const token = await getValidAccessToken();
  const path = joinPath(CACHE_ROOT, relativePath);

  await Filesystem.downloadFile({
    url: driveDownloadUrl(file.id),
    path,
    directory: Directory.Data,
    headers: { Authorization: `Bearer ${token}` },
  });

  return path;
}

async function downloadToWeb(
  file: DriveFileItem,
  storageKey: string
): Promise<void> {
  const blob = await downloadDriveFileBlob(file.id);
  await idbPut(storageKey, blob);
}

export async function syncDrivePlansToCache(
  folderId: string,
  label: string,
  plans: DriveCollectionPlan[],
  onProgress?: (progress: DriveSyncProgress) => void
): Promise<DriveCacheMeta> {
  const prev = await loadDriveCacheMeta();
  const prevById = new Map((prev?.files ?? []).map((f) => [f.id, f]));

  const wanted: {
    file: DriveFileItem;
    relativePath: string;
    storageKey: string;
  }[] = [];

  for (const plan of plans) {
    for (const file of plan.files) {
      const relativePath = joinPath(plan.relativeDir, file.name);
      const storageKey = `${folderId}/${relativePath}`;
      wanted.push({ file, relativePath, storageKey });
    }
  }

  const toFetch = wanted.filter(({ file }) =>
    needsDownload(file, prevById.get(file.id))
  );

  onProgress?.({
    phase: 'downloading',
    current: 0,
    total: toFetch.length,
  });

  const nextFiles: DriveCacheFileMeta[] = [];
  let done = 0;

  for (const item of wanted) {
    const existing = prevById.get(item.file.id);
    if (!needsDownload(item.file, existing) && existing) {
      nextFiles.push({
        ...existing,
        name: item.file.name,
        relativePath: item.relativePath,
        storageKey: item.storageKey,
      });
      continue;
    }

    onProgress?.({
      phase: 'downloading',
      current: done,
      total: toFetch.length,
      fileName: item.file.name,
    });

    if (isNative()) {
      const storageKey = await downloadToNative(item.file, item.relativePath);
      nextFiles.push({
        id: item.file.id,
        name: item.file.name,
        relativePath: item.relativePath,
        modifiedTime: item.file.modifiedTime,
        md5Checksum: item.file.md5Checksum,
        storageKey,
      });
    } else {
      await downloadToWeb(item.file, item.storageKey);
      nextFiles.push({
        id: item.file.id,
        name: item.file.name,
        relativePath: item.relativePath,
        modifiedTime: item.file.modifiedTime,
        md5Checksum: item.file.md5Checksum,
        storageKey: item.storageKey,
      });
    }

    done += 1;
    onProgress?.({
      phase: 'downloading',
      current: done,
      total: toFetch.length,
      fileName: item.file.name,
    });
  }

  // Remove arquivos que saíram da pasta remota.
  if (prev) {
    const wantedIds = new Set(wanted.map((w) => w.file.id));
    const stale = prev.files.filter((f) => !wantedIds.has(f.id));
    if (stale.length > 0) {
      if (isNative()) {
        for (const f of stale) {
          try {
            await Filesystem.deleteFile({
              path: f.storageKey.startsWith(CACHE_ROOT)
                ? f.storageKey
                : joinPath(CACHE_ROOT, f.relativePath),
              directory: Directory.Data,
            });
          } catch {
            /* ignore */
          }
        }
      } else {
        await idbDeleteKeys(stale.map((f) => f.storageKey));
      }
    }
  }

  const meta: DriveCacheMeta = {
    folderId,
    label,
    syncedAt: Date.now(),
    files: nextFiles,
    groups: plans.map((p) => ({
      id: p.id,
      title: p.title,
      fileIds: p.files.map((f) => f.id),
    })),
  };

  await saveDriveCacheMeta(meta);
  onProgress?.({ phase: 'done', current: toFetch.length, total: toFetch.length });
  return meta;
}

/** Monta grupos de mídia a partir do cache local (blob URLs na web). */
export async function mediaGroupsFromDriveCache(
  meta: DriveCacheMeta
): Promise<MediaCollectionGroup[]> {
  releaseDriveBlobUrls();
  const byId = new Map(meta.files.map((f) => [f.id, f]));
  const groups: MediaCollectionGroup[] = [];

  for (const group of meta.groups) {
    const entries: MediaFileEntry[] = [];

    for (const fileId of group.fileIds) {
      const file = byId.get(fileId);
      if (!file) continue;

      if (isNative()) {
        const path = file.storageKey.startsWith(CACHE_ROOT)
          ? file.storageKey
          : joinPath(CACHE_ROOT, file.relativePath);
        const { uri } = await Filesystem.getUri({
          path,
          directory: Directory.Data,
        });
        entries.push({
          name: file.name,
          src: Capacitor.convertFileSrc(uri),
          lastModified: file.modifiedTime
            ? Date.parse(file.modifiedTime)
            : undefined,
        });
      } else {
        const blob = await idbGet(file.storageKey);
        if (!blob) continue;
        const objectUrl = URL.createObjectURL(blob);
        activeBlobUrls.add(objectUrl);
        entries.push({
          name: file.name,
          src: objectUrl,
          lastModified: file.modifiedTime
            ? Date.parse(file.modifiedTime)
            : undefined,
        });
      }
    }

    if (entries.length === 0) continue;
    groups.push({
      id: group.id,
      title: group.title,
      entries,
    });
  }

  return groups;
}

/** @internal testes */
export function _needsDownloadForTest(
  file: DriveFileItem,
  existing: DriveCacheFileMeta | undefined
): boolean {
  return needsDownload(file, existing);
}

/** @internal testes */
export function _fileFingerprintForTest(file: DriveFileItem): string {
  return fileFingerprint(file);
}
