import { getValidAccessToken } from '@/lib/google-oauth';
import { isMediaFilename } from '@/lib/media-types';

const DRIVE_API = 'https://www.googleapis.com/drive/v3';
export const FOLDER_MIME = 'application/vnd.google-apps.folder';

export interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime?: string;
  md5Checksum?: string;
  size?: string;
}

async function driveFetch(
  path: string,
  init?: RequestInit & { raw?: boolean }
): Promise<Response> {
  const token = await getValidAccessToken();
  const headers = new Headers(init?.headers);
  headers.set('Authorization', `Bearer ${token}`);

  const res = await fetch(`${DRIVE_API}${path}`, {
    ...init,
    headers,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Google Drive API (${res.status}): ${text}`);
  }

  return res;
}

export async function listDriveChildren(
  folderId: string,
  options?: { foldersOnly?: boolean; filesOnly?: boolean }
): Promise<DriveFileItem[]> {
  const items: DriveFileItem[] = [];
  let pageToken: string | undefined;

  const clauses = [`'${folderId}' in parents`, 'trashed = false'];
  if (options?.foldersOnly) {
    clauses.push(`mimeType = '${FOLDER_MIME}'`);
  }

  do {
    const params = new URLSearchParams({
      q: clauses.join(' and '),
      spaces: 'drive',
      pageSize: '1000',
      fields:
        'nextPageToken, files(id, name, mimeType, modifiedTime, md5Checksum, size)',
      orderBy: 'folder,name_natural',
    });
    if (pageToken) params.set('pageToken', pageToken);

    const res = await driveFetch(`/files?${params.toString()}`);
    const data = (await res.json()) as {
      files?: DriveFileItem[];
      nextPageToken?: string;
    };

    for (const file of data.files ?? []) {
      if (options?.filesOnly && file.mimeType === FOLDER_MIME) continue;
      items.push(file);
    }
    pageToken = data.nextPageToken;
  } while (pageToken);

  return items;
}

export async function getDriveFile(fileId: string): Promise<DriveFileItem> {
  const params = new URLSearchParams({
    fields: 'id, name, mimeType, modifiedTime, md5Checksum, size',
  });
  const res = await driveFetch(`/files/${encodeURIComponent(fileId)}?${params}`);
  return (await res.json()) as DriveFileItem;
}

/** Baixa o conteúdo binário de um arquivo (não Google Docs nativos). */
export async function downloadDriveFileBlob(fileId: string): Promise<Blob> {
  const res = await driveFetch(
    `/files/${encodeURIComponent(fileId)}?alt=media`
  );
  return res.blob();
}

export function driveDownloadUrl(fileId: string): string {
  return `${DRIVE_API}/files/${encodeURIComponent(fileId)}?alt=media`;
}

export interface DriveCollectionPlan {
  id: string;
  title: string;
  /** Caminho relativo no cache local (ex.: '' ou 'Primavera'). */
  relativeDir: string;
  files: DriveFileItem[];
}

/**
 * Raiz + subpastas (1 nível), só mídia suportada — espelha a pasta local.
 */
export async function planDriveCollections(
  rootFolderId: string,
  rootTitle: string
): Promise<DriveCollectionPlan[]> {
  const children = await listDriveChildren(rootFolderId);
  const rootFiles: DriveFileItem[] = [];
  const subfolders: DriveFileItem[] = [];

  for (const child of children) {
    if (child.mimeType === FOLDER_MIME) {
      subfolders.push(child);
      continue;
    }
    if (isMediaFilename(child.name)) rootFiles.push(child);
  }

  subfolders.sort((a, b) =>
    a.name.localeCompare(b.name, undefined, {
      numeric: true,
      sensitivity: 'base',
    })
  );

  const plans: DriveCollectionPlan[] = [];

  if (rootFiles.length > 0) {
    plans.push({
      id: 'vitrine',
      title: rootTitle,
      relativeDir: '',
      files: rootFiles,
    });
  }

  for (const sub of subfolders) {
    const files = (await listDriveChildren(sub.id)).filter(
      (f) => f.mimeType !== FOLDER_MIME && isMediaFilename(f.name)
    );
    if (files.length === 0) continue;
    plans.push({
      id: `folder-${slugify(sub.name)}`,
      title: sub.name,
      relativeDir: sub.name,
      files,
    });
  }

  return plans;
}

function slugify(name: string): string {
  return (
    name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'colecao'
  );
}

export function countPlanFiles(plans: DriveCollectionPlan[]): number {
  return plans.reduce((n, p) => n + p.files.length, 0);
}
