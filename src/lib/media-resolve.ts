import type { CatalogSlide } from '@/data/catalog-slides';
import {
  resolveMediaUrl,
  resolveThumbUrl,
} from '@/lib/media-blob-cache';

export type CatalogMediaVariant = 'full' | 'thumb';

export function resolveCatalogImageSrc(
  slide: CatalogSlide,
  variant: CatalogMediaVariant,
  enabled = true
): string {
  if (!enabled) return '';
  if (variant === 'thumb') {
    const thumb = resolveThumbUrl(slide.id, slide.thumbSrc ?? '');
    if (thumb) return thumb;
  }
  return resolveMediaUrl(slide.id, slide.src);
}
