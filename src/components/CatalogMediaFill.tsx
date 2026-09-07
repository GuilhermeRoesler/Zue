import { cn } from '@/lib/utils';
import type { CatalogSlide } from '@/data/catalog-slides';
import { DEMO_THUMB_SIZES } from '@/data/catalog-slides';
import {
  resolveCatalogImageSrc,
  type CatalogMediaVariant,
} from '@/lib/media-resolve';

interface CatalogMediaFillProps {
  slide: CatalogSlide;
  className?: string;
  /** LCP / above-the-fold */
  priority?: boolean;
  /** Preferir thumb quando disponível (grades / carrossel embutido). */
  variant?: CatalogMediaVariant;
  /** Sobrescreve sizes do slide (ex.: grade de looks). */
  sizes?: string;
}

/** Imagem/vídeo object-cover com lazy, srcSet e fetchPriority. */
export function CatalogMediaFill({
  slide,
  className,
  priority = false,
  variant = 'full',
  sizes,
}: CatalogMediaFillProps) {
  if (slide.type === 'video') {
    const src = resolveCatalogImageSrc(slide, 'full', true);
    return (
      <video
        src={src || undefined}
        className={cn('h-full w-full object-cover', className)}
        muted
        playsInline
        autoPlay
        loop
        aria-label={slide.alt ?? slide.title ?? 'Look Zue'}
      />
    );
  }

  const displayVariant = priority ? 'full' : variant;
  const src = resolveCatalogImageSrc(slide, displayVariant, true);
  const useSrcSet = displayVariant === 'full' && Boolean(slide.srcSet);
  const resolvedSizes =
    sizes ??
    (displayVariant === 'thumb' ? DEMO_THUMB_SIZES : slide.sizes) ??
    undefined;

  return (
    <img
      src={src || undefined}
      srcSet={useSrcSet ? slide.srcSet : undefined}
      sizes={useSrcSet || sizes ? resolvedSizes : undefined}
      alt={slide.alt ?? slide.title ?? 'Look Zue'}
      width={slide.width}
      height={slide.height}
      className={cn('h-full w-full object-cover', className)}
      loading={priority ? 'eager' : 'lazy'}
      decoding={priority ? 'sync' : 'async'}
      fetchPriority={priority ? 'high' : 'auto'}
    />
  );
}
