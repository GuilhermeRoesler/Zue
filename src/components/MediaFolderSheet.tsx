import { FolderOpen, ImageIcon, RotateCcw } from 'lucide-react';
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
  error: string | null;
  onPickFolder: () => void;
  onUseDemo: () => void;
  onRefresh: () => void;
  onSortChange: (sort: MediaSort) => void;
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
  error,
  onPickFolder,
  onUseDemo,
  onRefresh,
  onSortChange,
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
            Pasta sincronizada do Drive: arquivos na raiz e subpastas viram
            coleções. Acesso: pressione a logo ZUE por 1 segundo.
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
                {collectionCount > 0
                  ? ` · ${collectionCount} ${collectionCount === 1 ? 'coleção' : 'coleções'}`
                  : null}
              </p>
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
                      : 'bg-white text-gray-600 hover:text-black'
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
