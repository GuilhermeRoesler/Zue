import { useCallback, useEffect, useState } from 'react';
import { ChevronRight, Folder, HardDrive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  listDriveChildren,
  type DriveFileItem,
} from '@/lib/google-drive-api';
import { cn } from '@/lib/utils';

interface DriveFolderPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (folder: { id: string; name: string }) => void;
}

interface Crumb {
  id: string;
  name: string;
}

const ROOT: Crumb = { id: 'root', name: 'Meu Drive' };

const DriveFolderPicker = ({
  open,
  onOpenChange,
  onSelect,
}: DriveFolderPickerProps) => {
  const [crumbs, setCrumbs] = useState<Crumb[]>([ROOT]);
  const [folders, setFolders] = useState<DriveFileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const current = crumbs[crumbs.length - 1] ?? ROOT;

  const load = useCallback(async (folderId: string) => {
    setLoading(true);
    setError(null);
    try {
      const children = await listDriveChildren(folderId, { foldersOnly: true });
      setFolders(children);
    } catch (err) {
      setFolders([]);
      setError(
        err instanceof Error ? err.message : 'Não foi possível listar pastas.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    setCrumbs([ROOT]);
    void load(ROOT.id);
  }, [open, load]);

  const enterFolder = (folder: DriveFileItem) => {
    setCrumbs((prev) => [...prev, { id: folder.id, name: folder.name }]);
    void load(folder.id);
  };

  const goToCrumb = (index: number) => {
    const next = crumbs.slice(0, index + 1);
    setCrumbs(next);
    void load(next[next.length - 1]?.id ?? ROOT.id);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg gap-0 rounded-none border-gray-200 p-0 sm:max-w-lg">
        <DialogHeader className="border-b border-gray-100 px-6 py-5 text-left">
          <DialogTitle
            className="text-xl font-light tracking-wide text-black"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Pasta no Google Drive
          </DialogTitle>
          <DialogDescription className="font-light text-gray-600">
            Escolha a pasta remota. No próximo start o app sincroniza o
            conteúdo para o cache local.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 px-6 py-5">
          <nav
            className="flex flex-wrap items-center gap-1 text-xs font-light tracking-wide text-gray-500"
            aria-label="Caminho"
          >
            {crumbs.map((crumb, index) => (
              <span key={crumb.id} className="flex items-center gap-1">
                {index > 0 && <ChevronRight className="size-3 opacity-50" />}
                <button
                  type="button"
                  onClick={() => goToCrumb(index)}
                  className={cn(
                    'uppercase tracking-[0.18em] transition-colors',
                    index === crumbs.length - 1
                      ? 'text-black'
                      : 'hover:text-black'
                  )}
                >
                  {crumb.name}
                </button>
              </span>
            ))}
          </nav>

          <div className="max-h-64 overflow-y-auto border border-gray-100">
            {loading && (
              <p className="px-4 py-6 text-sm font-light text-gray-500">
                Carregando pastas…
              </p>
            )}
            {!loading && error && (
              <p className="px-4 py-6 text-sm font-light text-red-700" role="alert">
                {error}
              </p>
            )}
            {!loading && !error && folders.length === 0 && (
              <p className="px-4 py-6 text-sm font-light text-gray-500">
                Nenhuma subpasta aqui. Você pode usar esta pasta mesmo assim.
              </p>
            )}
            {!loading &&
              !error &&
              folders.map((folder) => (
                <button
                  key={folder.id}
                  type="button"
                  onClick={() => enterFolder(folder)}
                  className="flex w-full items-center gap-3 border-b border-gray-50 px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-gray-50"
                >
                  <Folder className="size-4 shrink-0 text-gray-500" />
                  <span className="min-w-0 flex-1 truncate text-sm font-light text-black">
                    {folder.name}
                  </span>
                  <ChevronRight className="size-4 shrink-0 text-gray-400" />
                </button>
              ))}
          </div>

          {error == null && (
            <Button
              type="button"
              disabled={loading || current.id === 'root'}
              onClick={() => {
                if (current.id === 'root') return;
                onSelect({ id: current.id, name: current.name });
                onOpenChange(false);
              }}
              className="h-auto w-full gap-3 rounded-none bg-black px-6 py-4 font-light tracking-wide text-white hover:bg-gray-800 disabled:opacity-40"
            >
              <HardDrive className="size-4" />
              Usar “{current.name}”
            </Button>
          )}
          {current.id === 'root' && !error && (
            <p className="text-xs font-light text-gray-500">
              Entre em uma pasta (não use a raiz do Drive) para vincular à
              vitrine.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DriveFolderPicker;
