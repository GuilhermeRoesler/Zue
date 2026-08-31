import { registerPlugin } from '@capacitor/core';

export interface SafDirectoryEntry {
  name: string;
  uri: string;
  type: 'file' | 'directory';
  mtime?: number;
}

export interface SafReaddirResult {
  files: SafDirectoryEntry[];
  name?: string;
}

export interface SafDirectoryPlugin {
  takePersistablePermission(options: { path: string }): Promise<{ path: string }>;
  readdir(options: { path: string }): Promise<SafReaddirResult>;
  getDisplayName(options: { path: string }): Promise<{ name: string }>;
  hasPermission(options: { path: string }): Promise<{ granted: boolean }>;
}

const SafDirectory = registerPlugin<SafDirectoryPlugin>('SafDirectory', {
  web: () => ({
    async takePersistablePermission() {
      throw new Error('SafDirectory só está disponível no Android');
    },
    async readdir() {
      throw new Error('SafDirectory só está disponível no Android');
    },
    async getDisplayName() {
      throw new Error('SafDirectory só está disponível no Android');
    },
    async hasPermission() {
      return { granted: false };
    },
  }),
});

export default SafDirectory;
