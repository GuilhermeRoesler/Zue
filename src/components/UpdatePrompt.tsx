import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  type AvailableUpdate,
  dismissUpdate,
  downloadAndInstallUpdate,
  ensureInstallPermission,
} from '@/lib/app-update';

interface UpdatePromptProps {
  update: AvailableUpdate;
  onClose: () => void;
}

type Phase = 'prompt' | 'permission' | 'downloading' | 'error';

export default function UpdatePrompt({ update, onClose }: UpdatePromptProps) {
  const [phase, setPhase] = useState<Phase>('prompt');
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLater = () => {
    dismissUpdate(update.tag);
    onClose();
  };

  const handleUpdate = async () => {
    setErrorMessage('');
    try {
      const allowed = await ensureInstallPermission();
      if (!allowed) {
        setPhase('permission');
        return;
      }

      setPhase('downloading');
      setProgress(0);
      await downloadAndInstallUpdate(update.apkUrl, setProgress);
      // O instalador do sistema assume; fechamos o diálogo
      onClose();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Falha ao baixar a atualização';
      if (message.includes('INSTALL_PERMISSION_REQUIRED')) {
        setPhase('permission');
        return;
      }
      setErrorMessage(message);
      setPhase('error');
    }
  };

  const title =
    phase === 'downloading'
      ? 'Baixando atualização'
      : phase === 'permission'
        ? 'Permissão necessária'
        : phase === 'error'
          ? 'Não foi possível atualizar'
          : 'Nova versão disponível';

  const description =
    phase === 'downloading'
      ? `Baixando a versão ${update.versionName}…`
      : phase === 'permission'
        ? 'Permita que a Zue instale apps nas configurações do tablet e tente novamente.'
        : phase === 'error'
          ? errorMessage || 'Verifique a conexão e tente de novo.'
          : `A versão ${update.versionName} está pronta (atual: ${update.currentVersion}). Deseja atualizar agora?`;

  return (
    <Dialog open onOpenChange={(open) => !open && phase !== 'downloading' && onClose()}>
      <DialogContent
        showCloseButton={phase !== 'downloading'}
        className="rounded-none sm:max-w-md"
        onPointerDownOutside={(e) => {
          if (phase === 'downloading') e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          if (phase === 'downloading') e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle className="font-heading text-xl tracking-wide">
            {title}
          </DialogTitle>
          <DialogDescription className="font-light tracking-wide text-gray-600">
            {description}
          </DialogDescription>
        </DialogHeader>

        {phase === 'downloading' && (
          <div className="space-y-2">
            <div className="h-1.5 w-full overflow-hidden bg-gray-100">
              <div
                className="h-full bg-black transition-[width] duration-300"
                style={{ width: `${Math.max(progress, 4)}%` }}
              />
            </div>
            <p className="text-xs tracking-widest text-gray-500 uppercase">
              {progress}%
            </p>
          </div>
        )}

        <DialogFooter className="rounded-none border-t-0 bg-transparent sm:justify-end">
          {phase === 'prompt' && (
            <>
              <Button
                type="button"
                variant="outline"
                className="rounded-none"
                onClick={handleLater}
              >
                Agora não
              </Button>
              <Button
                type="button"
                className="rounded-none bg-black text-white hover:bg-black/80"
                onClick={() => void handleUpdate()}
              >
                Atualizar
              </Button>
            </>
          )}

          {phase === 'permission' && (
            <>
              <Button
                type="button"
                variant="outline"
                className="rounded-none"
                onClick={handleLater}
              >
                Agora não
              </Button>
              <Button
                type="button"
                className="rounded-none bg-black text-white hover:bg-black/80"
                onClick={() => void handleUpdate()}
              >
                Abrir configurações
              </Button>
            </>
          )}

          {phase === 'error' && (
            <>
              <Button
                type="button"
                variant="outline"
                className="rounded-none"
                onClick={onClose}
              >
                Fechar
              </Button>
              <Button
                type="button"
                className="rounded-none bg-black text-white hover:bg-black/80"
                onClick={() => void handleUpdate()}
              >
                Tentar de novo
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
