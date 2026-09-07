export type SlideType = 'image' | 'video';

export interface CatalogSlide {
  id: string;
  type: SlideType;
  /** Resolução cheia (fullscreen / LCP). */
  src: string;
  /** Thumb para carrossel embutido / grades (opcional). */
  thumbSrc?: string;
  /** srcSet responsivo (demo / CDN). */
  srcSet?: string;
  sizes?: string;
  width?: number;
  height?: number;
  alt?: string;
  title?: string;
}

export interface CatalogCollection {
  id: string;
  title: string;
  slides: CatalogSlide[];
}

const DEMO_SIZES_FULL = '100vw';
const DEMO_SIZES_THUMB = '(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw';

/** Demo local WebP (gerado por `npm run media:generate`). */
function demoImage(
  photoId: number,
  alt: string,
  title: string
): CatalogSlide {
  const w800 = `./demo/${photoId}-800.webp`;
  const w1200 = `./demo/${photoId}-1200.webp`;
  const w1600 = `./demo/${photoId}-1600.webp`;
  return {
    id: String(photoId),
    type: 'image',
    src: w1600,
    thumbSrc: w800,
    srcSet: `${w800} 800w, ${w1200} 1200w, ${w1600} 1600w`,
    sizes: DEMO_SIZES_FULL,
    width: 1200,
    height: 1600,
    alt,
    title,
  };
}

/** Slides de demonstração — usados quando nenhuma pasta de mídia está vinculada. */
export const CATALOG_SLIDES: CatalogSlide[] = [
  demoImage(7679720, 'Blazer estruturado', 'Coleção Primavera'),
  demoImage(7679471, 'Vestido midi', 'Elegância Atemporal'),
  demoImage(7679730, 'Conjunto sofisticado', 'Exclusividade'),
  demoImage(1926769, 'Editorial em preto', 'Silhueta'),
  demoImage(1536619, 'Look monocromático', 'Contraste'),
  demoImage(1183266, 'Casaco oversized', 'Volume'),
];

/** Tamanhos sugeridos para thumbs na grade do Hero (não fullscreen). */
export const DEMO_THUMB_SIZES = DEMO_SIZES_THUMB;

/** Coleções demo para layout de página (carrosséis empilhados). */
export const CATALOG_COLLECTIONS: CatalogCollection[] = [
  {
    id: 'primavera',
    title: 'Primavera',
    slides: [CATALOG_SLIDES[0]!, CATALOG_SLIDES[1]!, CATALOG_SLIDES[2]!],
  },
  {
    id: 'editorial',
    title: 'Editorial',
    slides: [CATALOG_SLIDES[3]!, CATALOG_SLIDES[4]!, CATALOG_SLIDES[5]!],
  },
];
