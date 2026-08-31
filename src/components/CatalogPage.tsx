import { useCallback, useEffect, useRef, useState } from 'react';
import type { CatalogCollection } from '@/data/catalog-slides';
import CatalogPlayer from '@/components/CatalogPlayer';
import Reveal from '@/components/Reveal';
import { useInView } from '@/hooks/use-in-view';
import { cn } from '@/lib/utils';

interface CatalogPageProps {
  collections: CatalogCollection[];
  loading?: boolean;
  error?: string | null;
  /** Pausa só em sheet/modais — não usar para hibernate. */
  paused?: boolean;
  onExpandChange?: (expanded: boolean) => void;
  /** Abre o sheet do gerente (estado vazio / erro). */
  onOpenMediaFolder?: () => void;
}

function CollectionBlock({
  collection,
  index,
  featured,
  expandedId,
  paused,
  onOpen,
  onClose,
}: {
  collection: CatalogCollection;
  index: number;
  featured: boolean;
  expandedId: string | null;
  paused: boolean;
  onOpen: (id: string) => void;
  onClose: () => void;
}) {
  const shellRef = useRef<HTMLElement | null>(null);
  const inView = useInView(shellRef, { rootMargin: '160px 0px', threshold: 0.15 });
  const active = expandedId === collection.id;
  const playbackActive = active || (expandedId === null && inView);

  return (
    <section
      ref={shellRef}
      className={cn(
        'flex w-full flex-col',
        featured ? 'gap-5' : 'gap-4'
      )}
    >
      <Reveal delay={Math.min(index * 70, 280)}>
        <div className="flex items-end justify-between gap-4">
          <h2
            className={cn(
              'font-heading font-light text-black',
              featured
                ? 'text-3xl tracking-[0.2em] sm:text-4xl'
                : 'text-xl tracking-[0.16em] sm:text-2xl'
            )}
          >
            {collection.title}
          </h2>
          <p className="shrink-0 pb-1 text-[10px] font-light tracking-[0.28em] text-gray-400 uppercase">
            {collection.slides.length}{' '}
            {collection.slides.length === 1 ? 'look' : 'looks'}
          </p>
        </div>
      </Reveal>

      <CatalogPlayer
        mode={active ? 'fullscreen' : 'embedded'}
        slides={collection.slides}
        featured={featured}
        playbackActive={playbackActive}
        paused={paused}
        onExpand={() => onOpen(collection.id)}
        onClose={active ? onClose : undefined}
      />
    </section>
  );
}

const CatalogPage = ({
  collections,
  loading = false,
  error = null,
  paused = false,
  onExpandChange,
  onOpenMediaFolder,
}: CatalogPageProps) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const isExpanded = expandedId !== null;

  useEffect(() => {
    onExpandChange?.(isExpanded);
  }, [isExpanded, onExpandChange]);

  const openCollection = useCallback((collectionId: string) => {
    setExpandedId(collectionId);
  }, []);

  const closeFullscreen = useCallback(() => {
    setExpandedId(null);
  }, []);

  const isEmpty = !loading && collections.length === 0;
  const showInitialLoading = loading && collections.length === 0;

  return (
    <div className="bg-background">
      <section className="relative overflow-hidden border-b border-black/5">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(0,0,0,0.04),_transparent_55%)]"
          aria-hidden
        />
        <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-10 sm:px-6 sm:pt-12 lg:px-8">
          <Reveal>
            <p className="text-[10px] font-light tracking-[0.4em] text-gray-500 uppercase">
              Vitrine
            </p>
            <h1 className="mt-3 font-heading text-5xl font-light tracking-[0.22em] text-black sm:text-6xl">
              ZUE
            </h1>
            <div className="mt-5 h-px w-16 bg-black/80 animate-zue-line" />
            <p className="mt-5 max-w-md text-sm font-light leading-relaxed tracking-wide text-gray-600">
              Coleções em movimento. Deslize os carrosséis; toque para tela cheia.
            </p>
          </Reveal>
        </div>
      </section>

      {showInitialLoading && (
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <p className="text-center text-sm font-light tracking-[0.2em] text-gray-500 uppercase">
            Carregando mídia…
          </p>
        </div>
      )}

      {!showInitialLoading && error && collections.length === 0 && (
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="border border-black/10 bg-gray-50 px-6 py-8 text-center">
            <p className="text-sm font-light text-red-700" role="alert">
              {error}
            </p>
            {onOpenMediaFolder && (
              <button
                type="button"
                onClick={onOpenMediaFolder}
                className="mt-6 text-xs font-light tracking-[0.25em] text-black uppercase underline-offset-4 hover:underline"
              >
                Abrir mídia da vitrine
              </button>
            )}
          </div>
        </div>
      )}

      {!showInitialLoading && isEmpty && (
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-lg border border-black/10 px-8 py-14 text-center">
            <p className="font-heading text-2xl font-light tracking-[0.18em] text-black">
              Sem mídia
            </p>
            <p className="mt-4 text-sm font-light leading-relaxed tracking-wide text-gray-600">
              Nenhuma coleção para exibir. Pressione a logo ZUE por cerca de 1
              segundo para selecionar a pasta da vitrine.
            </p>
            {onOpenMediaFolder && (
              <button
                type="button"
                onClick={onOpenMediaFolder}
                className="mt-8 border border-black bg-black px-6 py-3 text-xs font-light tracking-[0.28em] text-white uppercase transition-colors hover:bg-gray-800"
              >
                Selecionar pasta
              </button>
            )}
          </div>
        </div>
      )}

      {collections.length > 0 && (
        <div className="mx-auto flex max-w-7xl flex-col gap-24 px-4 pb-28 pt-12 sm:gap-28 sm:px-6 sm:pt-16 lg:px-8">
          {error && (
            <p className="text-center text-sm font-light text-red-700" role="alert">
              {error}
            </p>
          )}
          {collections.map((collection, i) => (
            <CollectionBlock
              key={collection.id}
              collection={collection}
              index={i}
              featured={i === 0}
              expandedId={expandedId}
              paused={paused}
              onOpen={openCollection}
              onClose={closeFullscreen}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CatalogPage;
