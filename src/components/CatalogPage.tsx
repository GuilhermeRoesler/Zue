import { useCallback, useEffect, useRef, useState } from 'react';
import type { CatalogCollection } from '@/data/catalog-slides';
import CatalogPlayer from '@/components/CatalogPlayer';
import Reveal from '@/components/Reveal';
import { prefersReducedMotion } from '@/lib/motion';

const FULLSCREEN_MOTION_MS = 380;

interface CatalogPageProps {
  collections: CatalogCollection[];
  /** Pausa só em sheet/modais — não usar para hibernate. */
  paused?: boolean;
  onExpandChange?: (expanded: boolean) => void;
}

const CatalogPage = ({
  collections,
  paused = false,
  onExpandChange,
}: CatalogPageProps) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [motionPhase, setMotionPhase] = useState<'idle' | 'enter' | 'exit'>(
    'idle'
  );
  const exitTimer = useRef<ReturnType<typeof setTimeout>>();

  const isExpanded = expandedId !== null;

  useEffect(() => {
    onExpandChange?.(isExpanded);
  }, [isExpanded, onExpandChange]);

  useEffect(
    () => () => {
      if (exitTimer.current !== undefined) clearTimeout(exitTimer.current);
    },
    []
  );

  const openCollection = useCallback((collectionId: string) => {
    if (exitTimer.current !== undefined) {
      clearTimeout(exitTimer.current);
      exitTimer.current = undefined;
    }
    setExpandedId(collectionId);
    setMotionPhase(prefersReducedMotion() ? 'idle' : 'enter');
  }, []);

  const closeFullscreen = useCallback(() => {
    if (!expandedId) return;
    if (prefersReducedMotion()) {
      setExpandedId(null);
      setMotionPhase('idle');
      return;
    }
    setMotionPhase('exit');
    if (exitTimer.current !== undefined) clearTimeout(exitTimer.current);
    exitTimer.current = setTimeout(() => {
      setExpandedId(null);
      setMotionPhase('idle');
      exitTimer.current = undefined;
    }, FULLSCREEN_MOTION_MS);
  }, [expandedId]);

  useEffect(() => {
    if (!isExpanded) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeFullscreen();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isExpanded, closeFullscreen]);

  return (
    <div className="bg-background">
      <section className="mx-auto max-w-7xl px-4 pb-12 pt-14 sm:px-6 lg:px-8">
        <Reveal>
          <h1 className="font-heading text-4xl font-light tracking-[0.2em] text-black sm:text-5xl">
            Catálogo
          </h1>
          <p className="mt-4 max-w-lg text-sm font-light leading-relaxed tracking-wide text-gray-600">
            Coleções em movimento. Toque num carrossel para ver em tela cheia.
          </p>
        </Reveal>
      </section>

      <div className="mx-auto flex max-w-7xl flex-col gap-28 px-4 pb-28 sm:gap-32 sm:px-6 lg:px-8">
        {collections.map((collection, i) => {
          const active = expandedId === collection.id;
          const fullscreenMotionClass = active
            ? motionPhase === 'exit'
              ? 'animate-zue-catalog-exit'
              : motionPhase === 'enter'
                ? 'animate-zue-catalog-enter'
                : undefined
            : undefined;

          return (
            <section
              key={collection.id}
              className="flex w-full flex-col gap-6"
            >
              <Reveal delay={i * 80}>
                <h2 className="font-heading text-2xl font-light tracking-[0.18em] text-black">
                  {collection.title}
                </h2>
              </Reveal>
              <CatalogPlayer
                mode={active ? 'fullscreen' : 'embedded'}
                slides={collection.slides}
                paused={paused}
                onExpand={() => openCollection(collection.id)}
                onClose={active ? closeFullscreen : undefined}
                fullscreenMotionClass={fullscreenMotionClass}
              />
            </section>
          );
        })}
      </div>
    </div>
  );
};

export default CatalogPage;
