export type SlideType = 'image' | 'video';

export interface CatalogSlide {
  id: string;
  type: SlideType;
  src: string;
  alt?: string;
  title?: string;
}

export interface CatalogCollection {
  id: string;
  title: string;
  slides: CatalogSlide[];
}

/** Slides de demonstração — usados quando nenhuma pasta de mídia está vinculada. */
export const CATALOG_SLIDES: CatalogSlide[] = [
  {
    id: '1',
    type: 'image',
    src: 'https://images.pexels.com/photos/7679720/pexels-photo-7679720.jpeg?auto=compress&cs=tinysrgb&w=1600',
    alt: 'Blazer estruturado',
    title: 'Coleção Primavera',
  },
  {
    id: '2',
    type: 'image',
    src: 'https://images.pexels.com/photos/7679471/pexels-photo-7679471.jpeg?auto=compress&cs=tinysrgb&w=1600',
    alt: 'Vestido midi',
    title: 'Elegância Atemporal',
  },
  {
    id: '3',
    type: 'image',
    src: 'https://images.pexels.com/photos/7679730/pexels-photo-7679730.jpeg?auto=compress&cs=tinysrgb&w=1600',
    alt: 'Conjunto sofisticado',
    title: 'Exclusividade',
  },
  {
    id: '4',
    type: 'image',
    src: 'https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=1600',
    alt: 'Editorial em preto',
    title: 'Silhueta',
  },
  {
    id: '5',
    type: 'image',
    src: 'https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?auto=compress&cs=tinysrgb&w=1600',
    alt: 'Look monocromático',
    title: 'Contraste',
  },
  {
    id: '6',
    type: 'image',
    src: 'https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?auto=compress&cs=tinysrgb&w=1600',
    alt: 'Casaco oversized',
    title: 'Volume',
  },
];

/** Coleções demo para layout de página (carrosséis empilhados). */
export const CATALOG_COLLECTIONS: CatalogCollection[] = [
  {
    id: 'primavera',
    title: 'Primavera',
    slides: [CATALOG_SLIDES[0], CATALOG_SLIDES[1], CATALOG_SLIDES[2]],
  },
  {
    id: 'editorial',
    title: 'Editorial',
    slides: [CATALOG_SLIDES[3], CATALOG_SLIDES[4], CATALOG_SLIDES[5]],
  },
];

/** Agrupa slides planos numa única coleção (pasta vinculada). */
export function slidesToVitrineCollection(
  slides: CatalogSlide[]
): CatalogCollection[] {
  return [{ id: 'vitrine', title: 'Vitrine', slides }];
}
