import { Preferences } from '@capacitor/preferences';
import type { CatalogCollection, CatalogSlide } from '@/data/catalog-slides';
import {
  countPlanFiles,
  getDriveFile,
  planDriveCollections,
} from '@/lib/google-drive-api';
import {
  clearDriveCache,
  loadDriveCacheMeta,
  mediaGroupsFromDriveCache,
  syncDrivePlansToCache,
  type DriveSyncProgress,
} from '@/lib/google-drive-cache';
import {
  clearGoogleTokens,
  completePendingGoogleOAuth,
  isGoogleDriveConfigured,
  isGoogleSignedIn,
  signInWithGoogle,
  signOutGoogle,
} from '@/lib/google-oauth';
import { releaseAllMediaUrls } from '@/lib/media-blob-cache';
import {
  collectionsFromMediaGroups,
  type MediaSort,
} from '@/lib/media-types';

const PREF_DRIVE_FOLDER_ID = 'zue.driveFolderId';
const PREF_DRIVE_FOLDER_LABEL = 'zue.driveFolderLabel';

export type { DriveSyncProgress };

export interface DriveMediaState {
  kind: 'drive';
  label: string;
  slides: CatalogSlide[];
  collections: CatalogCollection[];
  sort: MediaSort;
  syncedAt: number | null;
}

function flattenSlides(collections: CatalogCollection[]): CatalogSlide[] {
  return collections.flatMap((c) => c.slides);
}

async function buildDriveState(
  label: string,
  sort: MediaSort,
  syncedAt: number | null
): Promise<DriveMediaState> {
  const meta = await loadDriveCacheMeta();
  if (!meta) {
    throw new Error('Cache do Drive vazio. Sincronize a pasta.');
  }

  const groups = await mediaGroupsFromDriveCache(meta);
  const collections = collectionsFromMediaGroups(groups, sort);
  if (collections.length === 0) {
    throw new Error(
      'A pasta do Drive não contém imagens ou vídeos suportados.'
    );
  }

  return {
    kind: 'drive',
    label,
    collections,
    slides: flattenSlides(collections),
    sort,
    syncedAt: syncedAt ?? meta.syncedAt,
  };
}

export async function getSavedDriveFolder(): Promise<{
  folderId: string;
  label: string;
} | null> {
  const { value: folderId } = await Preferences.get({
    key: PREF_DRIVE_FOLDER_ID,
  });
  if (!folderId) return null;
  const { value: label } = await Preferences.get({
    key: PREF_DRIVE_FOLDER_LABEL,
  });
  return { folderId, label: label ?? 'Google Drive' };
}

export async function saveDriveFolderSelection(
  folderId: string,
  label: string
): Promise<void> {
  await Preferences.set({ key: PREF_DRIVE_FOLDER_ID, value: folderId });
  await Preferences.set({ key: PREF_DRIVE_FOLDER_LABEL, value: label });
}

export async function clearDriveFolderSelection(): Promise<void> {
  await Preferences.remove({ key: PREF_DRIVE_FOLDER_ID });
  await Preferences.remove({ key: PREF_DRIVE_FOLDER_LABEL });
  await clearDriveCache();
}

export {
  isGoogleDriveConfigured,
  isGoogleSignedIn,
  signInWithGoogle,
  signOutGoogle,
  clearGoogleTokens,
  completePendingGoogleOAuth,
};

/**
 * Sincroniza a pasta remota para o cache local e monta o catálogo.
 * Se a rede falhar e já houver cache, reutiliza o cache (offline).
 */
export async function syncAndLoadDriveFolder(
  sort: MediaSort,
  options?: {
    folderId?: string;
    label?: string;
    onProgress?: (progress: DriveSyncProgress) => void;
  }
): Promise<DriveMediaState> {
  const saved = await getSavedDriveFolder();
  const folderId = options?.folderId ?? saved?.folderId;
  if (!folderId) {
    throw new Error('Nenhuma pasta do Drive selecionada.');
  }

  let label = options?.label ?? saved?.label ?? 'Google Drive';

  try {
    options?.onProgress?.({ phase: 'planning', current: 0, total: 0 });

    // Confirma nome atual da pasta quando online.
    try {
      const remote = await getDriveFile(folderId);
      label = remote.name || label;
    } catch {
      /* usa label salvo */
    }

    const plans = await planDriveCollections(folderId, label);
    if (countPlanFiles(plans) === 0) {
      throw new Error(
        'A pasta do Drive não contém imagens ou vídeos suportados (jpg, png, webp, mp4…).'
      );
    }

    await saveDriveFolderSelection(folderId, label);
    const meta = await syncDrivePlansToCache(
      folderId,
      label,
      plans,
      options?.onProgress
    );

    releaseAllMediaUrls();
    return buildDriveState(label, sort, meta.syncedAt);
  } catch (error) {
    const cached = await loadDriveCacheMeta();
    if (cached && cached.folderId === folderId && cached.files.length > 0) {
      console.warn('[google-drive] sync falhou; usando cache:', error);
      releaseAllMediaUrls();
      return buildDriveState(cached.label, sort, cached.syncedAt);
    }
    throw error;
  }
}

/** Carrega só o cache (sem rede). Null se não houver. */
export async function restoreDriveFolderFromCache(
  sort: MediaSort
): Promise<DriveMediaState | null> {
  const saved = await getSavedDriveFolder();
  const meta = await loadDriveCacheMeta();
  if (!saved || !meta || meta.folderId !== saved.folderId) return null;
  if (meta.files.length === 0) return null;

  try {
    releaseAllMediaUrls();
    return buildDriveState(saved.label, sort, meta.syncedAt);
  } catch (error) {
    console.warn('[google-drive] restore cache:', error);
    return null;
  }
}

export async function connectGoogleAndPrepare(): Promise<void> {
  if (!isGoogleDriveConfigured()) {
    throw new Error(
      'Defina VITE_GOOGLE_OAUTH_CLIENT_ID e VITE_GOOGLE_OAUTH_CLIENT_SECRET para usar o Google Drive.'
    );
  }
  await signInWithGoogle();
}
