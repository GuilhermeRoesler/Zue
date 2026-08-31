export type SlideType = 'image' | 'video';

export interface CatalogSlide {
  id: string;
  type: SlideType;
  src: string;
  alt?: string;
  title?: string;
}

/** Slides de demonstração — substituir por pasta de mídia (Fase 3). */
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
    type: 'video',
    src: 'https://videos.pexels.com/video-files/4760241/4760241-uhd_2560_1440_25fps.mp4',
    alt: 'Editorial em movimento',
    title: 'Em movimento',
  },
  {
    id: '4',
    type: 'image',
    src: 'https://images.pexels.com/photos/7679730/pexels-photo-7679730.jpeg?auto=compress&cs=tinysrgb&w=1600',
    alt: 'Conjunto sofisticado',
    title: 'Exclusividade',
  },
  {
    id: '5',
    type: 'image',
    src: 'https://images.pexels.com/photos/7679654/pexels-photo-7679654.jpeg?auto=compress&cs=tinysrgb&w=1600',
    alt: 'Vestido longo',
    title: 'Nova coleção',
  },
];
