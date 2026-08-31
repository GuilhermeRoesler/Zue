import { FolderOpen, ImageIcon, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import type { MediaSourceKind } from '@/lib/media-folder';

interface MediaFolderSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  source: MediaSourceKind;
  folderLabel: string | null;
  slideCount: number;
  loading: boolean;
  error: string | null;
  onPickFolder: () => void;
  onUseDemo: () => void;
  onRefresh: () => void;
}

const MediaFolderSheet = ({
  open,
  onOpenChange,
  source,
  folderLabel,
  slideCount,
  loading,
  error,
  onPickFolder,
  onUseDemo,
  onRefresh,
}: MediaFolderSheetProps) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="gap-0 rounded-none border-t border-gray-200 bg-white p-0"
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
            Selecione a pasta sincronizada do Google Drive (imagens e vídeos).
            Acesso discreto: pressione a logo ZUE por 1 segundo.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 px-6 py-6">
          <div className="flex items-start gap-3 border border-gray-100 bg-gray-50 px-4 py-4">
            <ImageIcon className="mt-0.5 size-5 shrink-0 text-gray-500" />
            <div className="min-w-0 space-y-1">
              <p className="text-sm font-light tracking-wide text-black">
                {source === 'folder' ? 'Pasta ativa' : 'Catálogo demonstração'}
              </p>
              <p className="truncate text-sm font-light text-gray-600">
                {source === 'folder'
                  ? folderLabel ?? 'Pasta selecionada'
                  : 'Slides de exemplo (Pexels)'}
              </p>
              <p className="text-xs font-light text-gray-500">
                {slideCount} {slideCount === 1 ? 'arquivo' : 'arquivos'}
              </p>
            </div>
          </div>

          {error && (
            <p className="text-sm font-light text-red-700" role="alert">
              {error}
            </p>
          )}

          <div className="flex flex-col gap-3">
            <Button
              type="button"
              disabled={loading}
              onClick={onPickFolder}
              className="h-auto gap-3 rounded-none bg-black px-6 py-4 font-light tracking-wide text-white hover:bg-gray-800"
            >
              <FolderOpen className="size-4" />
              Selecionar pasta
            </Button>

            {source === 'folder' && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  disabled={loading}
                  onClick={onRefresh}
                  className="h-auto gap-3 rounded-none border-black px-6 py-4 font-light tracking-wide text-black hover:bg-black hover:text-white"
                >
                  <RotateCcw className="size-4" />
                  Atualizar pasta
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  disabled={loading}
                  onClick={onUseDemo}
                  className="h-auto rounded-none px-6 py-3 font-light tracking-wide text-gray-600 hover:bg-transparent hover:text-black"
                >
                  Usar catálogo demonstração
                </Button>
              </>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MediaFolderSheet;
