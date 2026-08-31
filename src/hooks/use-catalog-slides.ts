import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  CATALOG_COLLECTIONS,
  CATALOG_SLIDES,
  slidesToVitrineCollection,
  type CatalogCollection,
  type CatalogSlide,
} from '@/data/catalog-slides';
import {
  clearMediaFolder,
  pickMediaFolder,
  restoreMediaFolder,
  type MediaSourceKind,
} from '@/lib/media-folder';

export interface UseCatalogSlidesResult {
  slides: CatalogSlide[];
  collections: CatalogCollection[];
  source: MediaSourceKind;
  folderLabel: string | null;
  loading: boolean;
  error: string | null;
  pickFolder: () => Promise<void>;
  useDemo: () => Promise<void>;
  refresh: () => Promise<void>;
}

function revokeBlobUrls(slides: CatalogSlide[]) {
  for (const slide of slides) {
    if (slide.src.startsWith('blob:')) {
      URL.revokeObjectURL(slide.src);
    }
  }
}

export function useCatalogSlides(): UseCatalogSlidesResult {
  const [slides, setSlides] = useState<CatalogSlide[]>(CATALOG_SLIDES);
  const [source, setSource] = useState<MediaSourceKind>('demo');
  const [folderLabel, setFolderLabel] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const slidesRef = useRef(slides);
  slidesRef.current = slides;

  const collections = useMemo(() => {
    if (source === 'demo') return CATALOG_COLLECTIONS;
    return slidesToVitrineCollection(slides);
  }, [source, slides]);

  const applyFolder = useCallback((next: CatalogSlide[], label: string) => {
    revokeBlobUrls(slidesRef.current.filter((s) => s.src.startsWith('blob:')));
    setSlides(next);
    setSource('folder');
    setFolderLabel(label);
    setError(null);
  }, []);

  const applyDemo = useCallback(() => {
    revokeBlobUrls(slidesRef.current.filter((s) => s.src.startsWith('blob:')));
    setSlides(CATALOG_SLIDES);
    setSource('demo');
    setFolderLabel(null);
    setError(null);
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const restored = await restoreMediaFolder();
      if (restored && restored.slides.length > 0) {
        applyFolder(restored.slides, restored.label ?? 'Pasta');
      } else {
        applyDemo();
      }
    } catch (err) {
      console.warn('[useCatalogSlides]', err);
      applyDemo();
    } finally {
      setLoading(false);
    }
  }, [applyDemo, applyFolder]);

  useEffect(() => {
    void refresh();
    return () => {
      revokeBlobUrls(slidesRef.current.filter((s) => s.src.startsWith('blob:')));
    };
  }, [refresh]);

  const pickFolder = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await pickMediaFolder();
      applyFolder(result.slides, result.label ?? 'Pasta');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Não foi possível abrir a pasta.';
      // Usuário cancelou o picker — não tratar como erro ruidoso
      if (/abort|cancel|dismiss/i.test(message)) {
        setError(null);
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  }, [applyFolder]);

  const useDemo = useCallback(async () => {
    setLoading(true);
    try {
      await clearMediaFolder();
      applyDemo();
    } finally {
      setLoading(false);
    }
  }, [applyDemo]);

  return {
    slides,
    collections,
    source,
    folderLabel,
    loading,
    error,
    pickFolder,
    useDemo,
    refresh,
  };
}
