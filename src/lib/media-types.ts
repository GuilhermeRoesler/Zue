import type { CatalogCollection, CatalogSlide, SlideType } from '@/data/catalog-slides';
import { registerMediaFile } from '@/lib/media-blob-cache';

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

export type MediaSort = 'name' | 'date';

export interface MediaFileEntry {
  name: string;
  /** URL pronta (nativo) ou vazia se lazy via `file`. */
  src: string;
  /** Web: File para criar blob URL sob demanda. */
  file?: File;
  lastModified?: number;
}

export interface MediaCollectionGroup {
  id: string;
  title: string;
  entries: MediaFileEntry[];
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
  const cleaned =
    base.replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim() || filename;
  return cleaned.replace(/(^|\s)\S/g, (ch) => ch.toUpperCase());
}

function sortEntries(
  entries: MediaFileEntry[],
  sort: MediaSort
): MediaFileEntry[] {
  return [...entries].sort((a, b) => {
    if (sort === 'date') {
      const da = a.lastModified ?? 0;
      const db = b.lastModified ?? 0;
      if (da !== db) return db - da;
    }
    return a.name.localeCompare(b.name, undefined, {
      numeric: true,
      sensitivity: 'base',
    });
  });
}

/**
 * Converte entradas de pasta em slides ordenados.
 * Ignora arquivos que não são imagem/vídeo.
 * Metadados `alt`/`title` vêm do nome do arquivo.
 */
export function slidesFromMediaEntries(
  entries: MediaFileEntry[],
  sort: MediaSort = 'name',
  idPrefix = 'media'
): CatalogSlide[] {
  const slides: CatalogSlide[] = [];
  const sorted = sortEntries(entries, sort);

  for (const entry of sorted) {
    const type = getSlideType(entry.name);
    if (!type) continue;

    const id = `${idPrefix}-${entry.name}`;
    const title = titleFromFilename(entry.name);

    if (entry.file) {
      registerMediaFile(id, entry.file);
    }

    slides.push({
      id,
      type,
      src: entry.src,
      alt: title,
      title,
    });
  }

  return slides;
}

/** Agrupa pastas/subpastas em coleções (ordem: raiz primeiro, depois nome). */
export function collectionsFromMediaGroups(
  groups: MediaCollectionGroup[],
  sort: MediaSort = 'name'
): CatalogCollection[] {
  const collections: CatalogCollection[] = [];

  for (const group of groups) {
    const slides = slidesFromMediaEntries(group.entries, sort, group.id);
    if (slides.length === 0) continue;
    collections.push({
      id: group.id,
      title: group.title,
      slides,
    });
  }

  return collections;
}
