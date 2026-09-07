import type { CatalogCollection, CatalogSlide } from '@/data/catalog-slides';
import {
  getMediaFile,
  registerMediaThumb,
  resolveThumbUrl,
} from '@/lib/media-blob-cache';

/** Lado maior do thumb (carrossel embutido / grades). */
export const THUMB_MAX_EDGE = 960;
const THUMB_WEBP_QUALITY = 0.72;
const THUMB_JPEG_QUALITY = 0.78;
const CONCURRENCY = 3;

export function fitWithinMaxEdge(
  width: number,
  height: number,
  maxEdge = THUMB_MAX_EDGE
): { width: number; height: number } {
  if (width <= 0 || height <= 0) return { width: maxEdge, height: maxEdge };
  const longest = Math.max(width, height);
  if (longest <= maxEdge) return { width, height };
  const scale = maxEdge / longest;
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

async function blobFromCanvas(
  canvas: HTMLCanvasElement | OffscreenCanvas
): Promise<Blob | null> {
  const tryType = async (type: string, quality: number) => {
    if ('convertToBlob' in canvas) {
      return canvas.convertToBlob({ type, quality });
    }
    return new Promise<Blob | null>((resolve) => {
      (canvas as HTMLCanvasElement).toBlob(
        (b) => resolve(b),
        type,
        quality
      );
    });
  };

  try {
    const webp = await tryType('image/webp', THUMB_WEBP_QUALITY);
    if (webp && webp.size > 0) return webp;
  } catch {
    /* WebP indisponível */
  }

  try {
    return await tryType('image/jpeg', THUMB_JPEG_QUALITY);
  } catch {
    return null;
  }
}

async function decodeToBitmap(
  source: Blob | string
): Promise<ImageBitmap | null> {
  try {
    if (typeof source !== 'string') {
      return await createImageBitmap(source);
    }
    const res = await fetch(source);
    if (!res.ok) return null;
    const blob = await res.blob();
    return await createImageBitmap(blob);
  } catch {
    /* HEIC / CORS / decode falhou */
  }

  if (typeof source !== 'string') return null;

  return new Promise((resolve) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = async () => {
      try {
        resolve(await createImageBitmap(img));
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = source;
  });
}

/**
 * Gera thumb WebP (ou JPEG) a partir de Blob ou URL.
 * Retorna null se o decode falhar (ex.: HEIC sem suporte).
 */
export async function createImageThumb(
  source: Blob | string,
  maxEdge = THUMB_MAX_EDGE
): Promise<{ blob: Blob; width: number; height: number } | null> {
  const bitmap = await decodeToBitmap(source);
  if (!bitmap) return null;

  try {
    const { width, height } = fitWithinMaxEdge(
      bitmap.width,
      bitmap.height,
      maxEdge
    );
    const canvas =
      typeof OffscreenCanvas !== 'undefined'
        ? new OffscreenCanvas(width, height)
        : Object.assign(document.createElement('canvas'), { width, height });

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(bitmap, 0, 0, width, height);
    const blob = await blobFromCanvas(canvas);
    if (!blob) return null;
    return { blob, width: bitmap.width, height: bitmap.height };
  } finally {
    bitmap.close();
  }
}

async function mapPool<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let next = 0;

  async function worker() {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i]!);
    }
  }

  const workers = Array.from(
    { length: Math.min(limit, Math.max(1, items.length)) },
    () => worker()
  );
  await Promise.all(workers);
  return results;
}

async function enrichSlide(slide: CatalogSlide): Promise<CatalogSlide> {
  if (slide.type !== 'image') return slide;
  if (slide.thumbSrc || resolveThumbUrl(slide.id)) {
    return {
      ...slide,
      thumbSrc: slide.thumbSrc || resolveThumbUrl(slide.id) || undefined,
    };
  }

  const file = getMediaFile(slide.id);
  const source: Blob | string | null = file ?? (slide.src || null);
  if (!source) return slide;

  const thumb = await createImageThumb(source);
  if (!thumb) return slide;

  const thumbSrc = registerMediaThumb(slide.id, thumb.blob);
  return {
    ...slide,
    thumbSrc,
    width: slide.width ?? thumb.width,
    height: slide.height ?? thumb.height,
  };
}

/** Gera thumbs para imagens de coleções (pasta local / Drive). */
export async function enrichCollectionsWithThumbs(
  collections: CatalogCollection[]
): Promise<CatalogCollection[]> {
  return mapPool(collections, 1, async (collection) => {
    const slides = await mapPool(
      collection.slides,
      CONCURRENCY,
      enrichSlide
    );
    return { ...collection, slides };
  });
}
