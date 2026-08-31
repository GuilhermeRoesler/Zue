import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import ApkUpdater from '@/lib/apk-updater';

const GITHUB_OWNER = 'GuilhermeRoesler';
const GITHUB_REPO = 'Zue';
const DISMISS_KEY = 'zue:dismissed-update-tag';

export interface AvailableUpdate {
  tag: string;
  versionName: string;
  apkUrl: string;
  releaseName: string;
  currentVersion: string;
}

interface GitHubReleaseAsset {
  name: string;
  browser_download_url: string;
  content_type?: string;
}

interface GitHubRelease {
  tag_name: string;
  name: string | null;
  draft?: boolean;
  prerelease?: boolean;
  assets: GitHubReleaseAsset[];
}

function normalizeVersion(raw: string): string {
  return raw.trim().replace(/^v/i, '');
}

/** Compara semver simples (major.minor.patch). Retorna >0 se a > b. */
export function compareSemver(a: string, b: string): number {
  const parse = (version: string) => {
    const core = normalizeVersion(version).split(/[-+]/)[0] ?? '0';
    return core.split('.').map((n) => parseInt(n, 10) || 0);
  };
  const pa = parse(a);
  const pb = parse(b);
  const len = Math.max(pa.length, pb.length, 3);
  for (let i = 0; i < len; i++) {
    const da = pa[i] ?? 0;
    const db = pb[i] ?? 0;
    if (da !== db) return da - db;
  }
  return 0;
}

function pickApkAsset(assets: GitHubReleaseAsset[]): GitHubReleaseAsset | null {
  const apk = assets.find(
    (a) =>
      a.name.toLowerCase().endsWith('.apk') ||
      a.content_type === 'application/vnd.android.package-archive'
  );
  return apk ?? null;
}

function getDismissedTag(): string | null {
  try {
    return localStorage.getItem(DISMISS_KEY);
  } catch {
    return null;
  }
}

export function dismissUpdate(tag: string): void {
  try {
    localStorage.setItem(DISMISS_KEY, tag);
  } catch {
    // ignore quota / private mode
  }
}

/**
 * Consulta a latest release no GitHub sem bloquear a UI.
 * Retorna null se não houver update, se falhar, ou se o usuário adiou esta tag.
 */
export async function checkGitHubUpdate(): Promise<AvailableUpdate | null> {
  if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'android') {
    return null;
  }

  let currentVersion = '0.0.0';
  try {
    const info = await App.getInfo();
    currentVersion = normalizeVersion(info.version);
  } catch (error) {
    console.warn('[app-update] App.getInfo:', error);
  }

  const response = await fetch(
    `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases/latest`,
    {
      headers: {
        Accept: 'application/vnd.github+json',
        'User-Agent': 'Zue-Vitrine-Android',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`GitHub API ${response.status}`);
  }

  const release = (await response.json()) as GitHubRelease;
  if (release.draft || release.prerelease) {
    return null;
  }

  const tag = release.tag_name;
  const remoteVersion = normalizeVersion(tag);
  if (compareSemver(remoteVersion, currentVersion) <= 0) {
    return null;
  }

  if (getDismissedTag() === tag) {
    return null;
  }

  const asset = pickApkAsset(release.assets ?? []);
  if (!asset) {
    console.warn('[app-update] Release sem asset .apk:', tag);
    return null;
  }

  return {
    tag,
    versionName: remoteVersion,
    apkUrl: asset.browser_download_url,
    releaseName: release.name || tag,
    currentVersion,
  };
}

export async function ensureInstallPermission(): Promise<boolean> {
  const { allowed } = await ApkUpdater.canInstallPackages();
  if (allowed) return true;
  const result = await ApkUpdater.openInstallPermissionSettings();
  return result.allowed;
}

export async function downloadAndInstallUpdate(
  apkUrl: string,
  onProgress?: (progress: number) => void
): Promise<void> {
  const handle = onProgress
    ? await ApkUpdater.addListener('downloadProgress', (event) => {
        onProgress(event.progress);
      })
    : null;

  try {
    await ApkUpdater.downloadAndInstall({ url: apkUrl });
  } finally {
    await handle?.remove();
  }
}

/** Dispara a verificação sem await — erros só vão para o console. */
export function scheduleUpdateCheck(
  onAvailable: (update: AvailableUpdate) => void
): void {
  if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'android') {
    return;
  }

  const run = () => {
    void checkGitHubUpdate()
      .then((update) => {
        if (update) onAvailable(update);
      })
      .catch((error) => {
        console.warn('[app-update] check failed:', error);
      });
  };

  // Adia para não competir com a pintura inicial / kiosk
  if (typeof requestIdleCallback === 'function') {
    requestIdleCallback(() => run(), { timeout: 4000 });
  } else {
    setTimeout(run, 1500);
  }
}
