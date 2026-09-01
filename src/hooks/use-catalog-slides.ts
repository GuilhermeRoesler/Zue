import { useCallback, useEffect, useRef, useState } from 'react';
import {
  CATALOG_COLLECTIONS,
  CATALOG_SLIDES,
  type CatalogCollection,
  type CatalogSlide,
} from '@/data/catalog-slides';
import {
  clearDriveMediaSource,
  clearMediaFolder,
  getMediaSort,
  pickDriveFolder,
  pickMediaFolder,
  refreshMediaFolderWithSort,
  restoreMediaFolder,
  setMediaSort,
  type DriveSyncProgress,
  type MediaSort,
  type MediaSourceKind,
} from '@/lib/media-folder';
import {
  isGoogleDriveConfigured,
  isGoogleSignedIn,
  signInWithGoogle,
  signOutGoogle,
  completePendingGoogleOAuth,
} from '@/lib/google-drive';
import { releaseAllMediaUrls } from '@/lib/media-blob-cache';

export interface UseCatalogSlidesResult {
  slides: CatalogSlide[];
  collections: CatalogCollection[];
  source: MediaSourceKind;
  folderLabel: string | null;
  sort: MediaSort;
  loading: boolean;
  syncProgress: string | null;
  error: string | null;
  driveConfigured: boolean;
  driveSignedIn: boolean;
  pickFolder: () => Promise<void>;
  connectDrive: () => Promise<void>;
  pickDriveFolder: (folder: { id: string; name: string }) => Promise<void>;
  disconnectDrive: () => Promise<void>;
  useDemo: () => Promise<void>;
  refresh: () => Promise<void>;
  setSort: (sort: MediaSort) => Promise<void>;
}

function formatSyncProgress(progress: DriveSyncProgress): string | null {
  if (progress.phase === 'planning') return 'Consultando Google Drive…';
  if (progress.phase === 'done') return null;
  if (progress.total <= 0) return 'Sincronizando…';
  const name = progress.fileName ? ` · ${progress.fileName}` : '';
  return `Baixando ${progress.current}/${progress.total}${name}`;
}

export function useCatalogSlides(): UseCatalogSlidesResult {
  const [slides, setSlides] = useState<CatalogSlide[]>(CATALOG_SLIDES);
  const [collections, setCollections] =
    useState<CatalogCollection[]>(CATALOG_COLLECTIONS);
  const [source, setSource] = useState<MediaSourceKind>('demo');
  const [folderLabel, setFolderLabel] = useState<string | null>(null);
  const [sort, setSortState] = useState<MediaSort>('name');
  const [loading, setLoading] = useState(true);
  const [syncProgress, setSyncProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [driveConfigured] = useState(() => isGoogleDriveConfigured());
  const [driveSignedIn, setDriveSignedIn] = useState(false);
  const mountedRef = useRef(true);

  const refreshDriveAuth = useCallback(async () => {
    if (!isGoogleDriveConfigured()) {
      setDriveSignedIn(false);
      return;
    }
    try {
      await completePendingGoogleOAuth();
    } catch (err) {
      console.warn('[useCatalogSlides] oauth pending:', err);
    }
    setDriveSignedIn(await isGoogleSignedIn());
  }, []);

  const applyLinked = useCallback(
    (
      kind: 'folder' | 'drive',
      nextSlides: CatalogSlide[],
      nextCollections: CatalogCollection[],
      label: string,
      nextSort: MediaSort
    ) => {
      setSlides(nextSlides);
      setCollections(nextCollections);
      setSource(kind);
      setFolderLabel(label);
      setSortState(nextSort);
      setError(null);
      setSyncProgress(null);
    },
    []
  );

  const applyDemo = useCallback(async () => {
    releaseAllMediaUrls();
    const savedSort = await getMediaSort();
    setSlides(CATALOG_SLIDES);
    setCollections(CATALOG_COLLECTIONS);
    setSource('demo');
    setFolderLabel(null);
    setSortState(savedSort);
    setError(null);
    setSyncProgress(null);
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSyncProgress(null);
    try {
      await refreshDriveAuth();
      const restored = await restoreMediaFolder({
        onDriveProgress: (p) => {
          if (mountedRef.current) setSyncProgress(formatSyncProgress(p));
        },
      });
      if (!mountedRef.current) return;
      if (restored && restored.collections.length > 0) {
        applyLinked(
          restored.kind === 'drive' ? 'drive' : 'folder',
          restored.slides,
          restored.collections,
          restored.label ?? (restored.kind === 'drive' ? 'Drive' : 'Pasta'),
          restored.sort
        );
      } else {
        await applyDemo();
      }
    } catch (err) {
      console.warn('[useCatalogSlides]', err);
      if (mountedRef.current) {
        const message =
          err instanceof Error ? err.message : 'Falha ao carregar mídia.';
        setError(message);
        await applyDemo();
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
        setSyncProgress(null);
      }
    }
  }, [applyDemo, applyLinked, refreshDriveAuth]);

  useEffect(() => {
    mountedRef.current = true;
    void refresh();
    return () => {
      mountedRef.current = false;
      releaseAllMediaUrls();
    };
  }, [refresh]);

  const pickFolder = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await pickMediaFolder();
      if (!mountedRef.current) return;
      applyLinked(
        'folder',
        result.slides,
        result.collections,
        result.label ?? 'Pasta',
        result.sort
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Não foi possível abrir a pasta.';
      if (/abort|cancel|dismiss/i.test(message)) {
        setError(null);
      } else {
        setError(message);
      }
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [applyLinked]);

  const connectDrive = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
      if (mountedRef.current) setDriveSignedIn(true);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Não foi possível conectar ao Google.';
      if (!/redirecionando/i.test(message)) {
        setError(message);
      }
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  const pickDriveFolderAction = useCallback(
    async (folder: { id: string; name: string }) => {
      setLoading(true);
      setError(null);
      setSyncProgress('Consultando Google Drive…');
      try {
        const result = await pickDriveFolder(folder.id, folder.name, (p) => {
          if (mountedRef.current) setSyncProgress(formatSyncProgress(p));
        });
        if (!mountedRef.current) return;
        applyLinked(
          'drive',
          result.slides,
          result.collections,
          result.label ?? folder.name,
          result.sort
        );
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Não foi possível sincronizar o Drive.';
        setError(message);
      } finally {
        if (mountedRef.current) {
          setLoading(false);
          setSyncProgress(null);
        }
      }
    },
    [applyLinked]
  );

  const disconnectDrive = useCallback(async () => {
    setLoading(true);
    try {
      await signOutGoogle();
      await clearDriveMediaSource();
      if (mountedRef.current) {
        setDriveSignedIn(false);
        if (source === 'drive') await applyDemo();
      }
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [applyDemo, source]);

  const useDemo = useCallback(async () => {
    setLoading(true);
    try {
      await clearMediaFolder();
      if (mountedRef.current) await applyDemo();
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [applyDemo]);

  const setSort = useCallback(
    async (next: MediaSort) => {
      setLoading(true);
      setError(null);
      try {
        await setMediaSort(next);
        if (source === 'demo') {
          setSortState(next);
          return;
        }
        const refreshed = await refreshMediaFolderWithSort(next);
        if (!mountedRef.current) return;
        if (refreshed && refreshed.collections.length > 0) {
          applyLinked(
            refreshed.kind === 'drive' ? 'drive' : 'folder',
            refreshed.slides,
            refreshed.collections,
            refreshed.label ?? 'Pasta',
            refreshed.sort
          );
        } else {
          setSortState(next);
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Não foi possível reordenar.';
        setError(message);
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    },
    [applyLinked, source]
  );

  return {
    slides,
    collections,
    source,
    folderLabel,
    sort,
    loading,
    syncProgress,
    error,
    driveConfigured,
    driveSignedIn,
    pickFolder,
    connectDrive,
    pickDriveFolder: pickDriveFolderAction,
    disconnectDrive,
    useDemo,
    refresh,
    setSort,
  };
}
