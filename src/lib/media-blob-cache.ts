/** Cache de blob URLs (web) — cria sob demanda e revoga ao liberar. */

const files = new Map<string, File>();
const urls = new Map<string, string>();
const thumbUrls = new Map<string, string>();

export function registerMediaFile(id: string, file: File): void {
  const prev = urls.get(id);
  if (prev) {
    URL.revokeObjectURL(prev);
    urls.delete(id);
  }
  files.set(id, file);
}

export function getMediaFile(id: string): File | undefined {
  return files.get(id);
}

export function hasMediaFile(id: string): boolean {
  return files.has(id);
}

/** Resolve URL: src já definido (nativo) ou blob lazy (web). */
export function resolveMediaUrl(id: string, src: string): string {
  if (src) return src;
  const cached = urls.get(id);
  if (cached) return cached;
  const file = files.get(id);
  if (!file) return '';
  const url = URL.createObjectURL(file);
  urls.set(id, url);
  return url;
}

/** Registra thumb gerado no ingest; revoga anterior se houver. */
export function registerMediaThumb(id: string, blob: Blob): string {
  const prev = thumbUrls.get(id);
  if (prev) URL.revokeObjectURL(prev);
  const url = URL.createObjectURL(blob);
  thumbUrls.set(id, url);
  return url;
}

export function resolveThumbUrl(id: string, thumbSrc = ''): string {
  if (thumbSrc) return thumbSrc;
  return thumbUrls.get(id) ?? '';
}

export function releaseMediaUrl(id: string): void {
  const url = urls.get(id);
  if (url) {
    URL.revokeObjectURL(url);
    urls.delete(id);
  }
  const thumb = thumbUrls.get(id);
  if (thumb) {
    URL.revokeObjectURL(thumb);
    thumbUrls.delete(id);
  }
}

export function releaseAllMediaUrls(): void {
  for (const url of urls.values()) {
    URL.revokeObjectURL(url);
  }
  for (const url of thumbUrls.values()) {
    URL.revokeObjectURL(url);
  }
  urls.clear();
  thumbUrls.clear();
  files.clear();
}
