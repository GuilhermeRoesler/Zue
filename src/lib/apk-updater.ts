import { registerPlugin, type PluginListenerHandle } from '@capacitor/core';

export interface DownloadProgressEvent {
  progress: number;
}

export interface ApkUpdaterPlugin {
  canInstallPackages(): Promise<{ allowed: boolean }>;
  openInstallPermissionSettings(): Promise<{ allowed: boolean }>;
  downloadAndInstall(options: { url: string }): Promise<void>;
  addListener(
    eventName: 'downloadProgress',
    listenerFunc: (event: DownloadProgressEvent) => void
  ): Promise<PluginListenerHandle>;
}

const ApkUpdater = registerPlugin<ApkUpdaterPlugin>('ApkUpdater', {
  web: () => ({
    async canInstallPackages() {
      return { allowed: false };
    },
    async openInstallPermissionSettings() {
      return { allowed: false };
    },
    async downloadAndInstall() {
      throw new Error('APK updates are only available on Android');
    },
    async addListener() {
      return { remove: async () => undefined };
    },
  }),
});

export default ApkUpdater;
