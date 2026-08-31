import type { CatalogSlide, SlideType } from '@/data/catalog-slides';

export const IMAGE_EXTENSIONS = new Set([
  'jpg',
  'jpeg',
  'png',
  'webp',
  'gif',
  'bmp',
  'heic',
  'heif',
]);

export const VIDEO_EXTENSIONS = new Set([
  'mp4',
  'webm',
  'mov',
  'm4v',
  'mkv',
]);

export interface MediaFileEntry {
  name: string;
  /** Absolute path (native) or blob/object URL (web). */
  src: string;
}

export function getExtension(filename: string): string {
  const i = filename.lastIndexOf('.');
  if (i < 0) return '';
  return filename.slice(i + 1).toLowerCase();
}

export function getSlideType(filename: string): SlideType | null {
  const ext = getExtension(filename);
  if (IMAGE_EXTENSIONS.has(ext)) return 'image';
  if (VIDEO_EXTENSIONS.has(ext)) return 'video';
  return null;
}

export function isMediaFilename(filename: string): boolean {
  return getSlideType(filename) !== null;
}

/** Título amigável a partir do nome do arquivo (sem extensão). */
export function titleFromFilename(filename: string): string {
  const base = filename.replace(/\.[^.]+$/, '');
  return base.replace(/[_-]+/g, ' ').trim() || filename;
}

/**
 * Converte entradas de pasta em slides ordenados por nome.
 * Ignora arquivos que não são imagem/vídeo.
 */
export function slidesFromMediaEntries(entries: MediaFileEntry[]): CatalogSlide[] {
  const slides: CatalogSlide[] = [];

  const sorted = [...entries].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
  );

  for (const entry of sorted) {
    const type = getSlideType(entry.name);
    if (!type) continue;

    slides.push({
      id: `media-${entry.name}`,
      type,
      src: entry.src,
      alt: titleFromFilename(entry.name),
      title: titleFromFilename(entry.name),
    });
  }

  return slides;
}
