import { useCallback, useEffect, useRef, useState } from 'react';
import {
  CATALOG_COLLECTIONS,
  CATALOG_SLIDES,
  type CatalogCollection,
  type CatalogSlide,
} from '@/data/catalog-slides';
import { releaseAllMediaUrls } from '@/lib/media-blob-cache';
import {
  clearMediaFolder,
  getMediaSort,
  pickMediaFolder,
  refreshMediaFolderWithSort,
  restoreMediaFolder,
  setMediaSort,
  type MediaSort,
  type MediaSourceKind,
} from '@/lib/media-folder';

export interface UseCatalogSlidesResult {
  slides: CatalogSlide[];
  collections: CatalogCollection[];
  source: MediaSourceKind;
  folderLabel: string | null;
  sort: MediaSort;
  loading: boolean;
  error: string | null;
  pickFolder: () => Promise<void>;
  useDemo: () => Promise<void>;
  refresh: () => Promise<void>;
  setSort: (sort: MediaSort) => Promise<void>;
}

export function useCatalogSlides(): UseCatalogSlidesResult {
  const [slides, setSlides] = useState<CatalogSlide[]>(CATALOG_SLIDES);
  const [collections, setCollections] =
    useState<CatalogCollection[]>(CATALOG_COLLECTIONS);
  const [source, setSource] = useState<MediaSourceKind>('demo');
  const [folderLabel, setFolderLabel] = useState<string | null>(null);
  const [sort, setSortState] = useState<MediaSort>('name');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const applyFolder = useCallback(
    (
      nextSlides: CatalogSlide[],
      nextCollections: CatalogCollection[],
      label: string,
      nextSort: MediaSort
    ) => {
      setSlides(nextSlides);
      setCollections(nextCollections);
      setSource('folder');
      setFolderLabel(label);
      setSortState(nextSort);
      setError(null);
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
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const restored = await restoreMediaFolder();
      if (!mountedRef.current) return;
      if (restored && restored.collections.length > 0) {
        applyFolder(
          restored.slides,
          restored.collections,
          restored.label ?? 'Pasta',
          restored.sort
        );
      } else {
        await applyDemo();
      }
    } catch (err) {
      console.warn('[useCatalogSlides]', err);
      if (mountedRef.current) await applyDemo();
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [applyDemo, applyFolder]);

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
      applyFolder(
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
  }, [applyFolder]);

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
          applyFolder(
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
    [applyFolder, source]
  );

  return {
    slides,
    collections,
    source,
    folderLabel,
    sort,
    loading,
    error,
    pickFolder,
    useDemo,
    refresh,
    setSort,
  };
}
