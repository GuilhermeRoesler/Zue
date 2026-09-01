import { useState } from 'react';
import { Cloud, FolderOpen, ImageIcon, RotateCcw } from 'lucide-react';
import DriveFolderPicker from '@/components/DriveFolderPicker';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import type { MediaSort, MediaSourceKind } from '@/lib/media-folder';
import { cn } from '@/lib/utils';

interface MediaFolderSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  source: MediaSourceKind;
  folderLabel: string | null;
  slideCount: number;
  collectionCount: number;
  sort: MediaSort;
  loading: boolean;
  syncProgress: string | null;
  error: string | null;
  driveConfigured: boolean;
  driveSignedIn: boolean;
  onPickFolder: () => void;
  onConnectDrive: () => void;
  onPickDriveFolder: (folder: { id: string; name: string }) => void;
  onDisconnectDrive: () => void;
  onUseDemo: () => void;
  onRefresh: () => void;
  onSortChange: (sort: MediaSort) => void;
}

function sourceTitle(source: MediaSourceKind): string {
  if (source === 'folder') return 'Pasta local';
  if (source === 'drive') return 'Google Drive';
  return 'Catálogo demonstração';
}

function sourceSubtitle(
  source: MediaSourceKind,
  folderLabel: string | null
): string {
  if (source === 'folder') return folderLabel ?? 'Pasta selecionada';
  if (source === 'drive') return folderLabel ?? 'Pasta do Drive';
  return 'Slides de exemplo (Pexels)';
}

const MediaFolderSheet = ({
  open,
  onOpenChange,
  source,
  folderLabel,
  slideCount,
  collectionCount,
  sort,
  loading,
  syncProgress,
  error,
  driveConfigured,
  driveSignedIn,
  onPickFolder,
  onConnectDrive,
  onPickDriveFolder,
  onDisconnectDrive,
  onUseDemo,
  onRefresh,
  onSortChange,
}: MediaFolderSheetProps) => {
  const [drivePickerOpen, setDrivePickerOpen] = useState(false);
  const hasLinkedSource = source === 'folder' || source === 'drive';

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="bottom"
          className="max-h-[92dvh] gap-0 overflow-y-auto rounded-none border-t border-gray-200 bg-white p-0"
          showCloseButton
        >
          <SheetHeader className="border-b border-gray-100 px-6 py-5 text-left">
            <SheetTitle
              className="text-xl font-light tracking-wide text-black"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Mídia da vitrine
            </SheetTitle>
            <SheetDescription className="font-light text-gray-600">
              Pasta local (Drive sync no tablet) ou integração direta com o
              Google Drive. Acesso: pressione a logo ZUE por 1 segundo.
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-6 px-6 py-6">
            <div className="flex items-start gap-3 border border-gray-100 bg-gray-50 px-4 py-4">
              <ImageIcon className="mt-0.5 size-5 shrink-0 text-gray-500" />
              <div className="min-w-0 space-y-1">
                <p className="text-sm font-light tracking-wide text-black">
                  {sourceTitle(source)}
                </p>
                <p className="truncate text-sm font-light text-gray-600">
                  {sourceSubtitle(source, folderLabel)}
                </p>
                <p className="text-xs font-light text-gray-500">
                  {slideCount} {slideCount === 1 ? 'arquivo' : 'arquivos'}
                  {collectionCount > 0
                    ? ` · ${collectionCount} ${collectionCount === 1 ? 'coleção' : 'coleções'}`
                    : null}
                </p>
                {syncProgress && (
                  <p className="text-xs font-light text-gray-500">
                    {syncProgress}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[10px] font-light tracking-[0.28em] text-gray-500 uppercase">
                Ordenação
              </p>
              <div className="flex border border-gray-200">
                {(
                  [
                    { id: 'name', label: 'Nome' },
                    { id: 'date', label: 'Data' },
                  ] as const
                ).map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    disabled={loading}
                    onClick={() => onSortChange(option.id)}
                    className={cn(
                      'flex-1 px-4 py-3 text-xs font-light tracking-[0.2em] uppercase transition-colors',
                      sort === option.id
                        ? 'bg-black text-white'
                        : 'bg-white text-gray-600 hover:text-black active:text-black'
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <p className="text-sm font-light text-red-700" role="alert">
                {error}
              </p>
            )}

            <div className="space-y-3">
              <p className="text-[10px] font-light tracking-[0.28em] text-gray-500 uppercase">
                Pasta local
              </p>
              <Button
                type="button"
                disabled={loading}
                onClick={onPickFolder}
                className="h-auto min-h-11 w-full gap-3 rounded-none bg-black px-6 py-4 font-light tracking-wide text-white hover:bg-gray-800 active:bg-gray-900"
              >
                <FolderOpen className="size-4" />
                Selecionar pasta do aparelho
              </Button>
            </div>

            <div className="space-y-3">
              <p className="text-[10px] font-light tracking-[0.28em] text-gray-500 uppercase">
                Google Drive
              </p>
              {!driveConfigured && (
                <p className="text-sm font-light text-gray-500">
                  Integração disponível após configurar{' '}
                  <span className="text-gray-700">
                    VITE_GOOGLE_OAUTH_CLIENT_ID
                  </span>{' '}
                  e{' '}
                  <span className="text-gray-700">
                    VITE_GOOGLE_OAUTH_CLIENT_SECRET
                  </span>{' '}
                  (ver README).
                </p>
              )}
              {driveConfigured && !driveSignedIn && (
                <Button
                  type="button"
                  disabled={loading}
                  onClick={onConnectDrive}
                  className="h-auto min-h-11 w-full gap-3 rounded-none border border-black bg-white px-6 py-4 font-light tracking-wide text-black hover:bg-black hover:text-white active:bg-black active:text-white"
                >
                  <Cloud className="size-4" />
                  Conectar Google Drive
                </Button>
              )}
              {driveConfigured && driveSignedIn && (
                <>
                  <Button
                    type="button"
                    disabled={loading}
                    onClick={() => setDrivePickerOpen(true)}
                    className="h-auto min-h-11 w-full gap-3 rounded-none border border-black bg-white px-6 py-4 font-light tracking-wide text-black hover:bg-black hover:text-white active:bg-black active:text-white"
                  >
                    <Cloud className="size-4" />
                    Escolher pasta no Drive
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    disabled={loading}
                    onClick={onDisconnectDrive}
                    className="h-auto min-h-11 w-full rounded-none px-6 py-3 font-light tracking-wide text-gray-600 hover:bg-transparent hover:text-black active:bg-transparent active:text-black"
                  >
                    Desconectar Google
                  </Button>
                </>
              )}
            </div>

            {hasLinkedSource && (
              <div className="flex flex-col gap-3 border-t border-gray-100 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  disabled={loading}
                  onClick={onRefresh}
                  className="h-auto min-h-11 gap-3 rounded-none border-black px-6 py-4 font-light tracking-wide text-black hover:bg-black hover:text-white active:bg-black active:text-white"
                >
                  <RotateCcw className="size-4" />
                  {source === 'drive' ? 'Sincronizar Drive' : 'Atualizar pasta'}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  disabled={loading}
                  onClick={onUseDemo}
                  className="h-auto min-h-11 rounded-none px-6 py-3 font-light tracking-wide text-gray-600 hover:bg-transparent hover:text-black active:bg-transparent active:text-black"
                >
                  Usar catálogo demonstração
                </Button>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <DriveFolderPicker
        open={drivePickerOpen}
        onOpenChange={setDrivePickerOpen}
        onSelect={onPickDriveFolder}
      />
    </>
  );
};

export default MediaFolderSheet;
