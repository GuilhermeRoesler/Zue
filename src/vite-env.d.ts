/// <reference types="vite/client" />

/** Extensões do File System Access API usadas no seletor de pasta (web). */
interface FileSystemHandlePermissionDescriptor {
  mode?: 'read' | 'readwrite';
}

interface ZueFileSystemHandle {
  readonly kind: 'file' | 'directory';
  readonly name: string;
  queryPermission(
    descriptor?: FileSystemHandlePermissionDescriptor
  ): Promise<PermissionState>;
  requestPermission(
    descriptor?: FileSystemHandlePermissionDescriptor
  ): Promise<PermissionState>;
}

interface ZueFileSystemFileHandle extends ZueFileSystemHandle {
  readonly kind: 'file';
  getFile(): Promise<File>;
}

interface ZueFileSystemDirectoryHandle extends ZueFileSystemHandle {
  readonly kind: 'directory';
  entries(): AsyncIterableIterator<
    [string, ZueFileSystemFileHandle | ZueFileSystemDirectoryHandle]
  >;
}

interface Window {
  showDirectoryPicker?: (options?: {
    mode?: 'read' | 'readwrite';
  }) => Promise<ZueFileSystemDirectoryHandle>;
}
