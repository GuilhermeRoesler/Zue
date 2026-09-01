import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import Autoplay from 'embla-carousel-autoplay';
import type { AutoplayType } from 'embla-carousel-autoplay';
import { motion, useReducedMotion, type Transition } from 'motion/react';
import { ArrowLeft, Maximize2 } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel';
import type { CatalogSlide } from '@/data/catalog-slides';
import { IMAGE_SLIDE_MS } from '@/lib/idle-config';
import { resolveMediaUrl } from '@/lib/media-blob-cache';
import { prefersReducedMotion } from '@/lib/motion';
import { cn } from '@/lib/utils';

export type CatalogPlayerMode = 'embedded' | 'fullscreen';

const CHROME_HIDE_MS = 2000;
const HINT_HIDE_MS = 4200;
const CLICK_DRAG_THRESHOLD_PX = 8;

/**
 * Easing/duração da transição fullscreen (FLIP via `motion`).
 * Curva de desaceleração suave (sem bounce) para manter o tom minimalista.
 * A mesma transição é usada no container e na mídia para que ambos os
 * projections (`layout`) fiquem sincronizados quadro a quadro.
 */
const FULLSCREEN_TRANSITION: Transition = {
  duration: 0.56,
  ease: [0.22, 1, 0.36, 1],
};
const INSTANT_TRANSITION: Transition = { duration: 0 };

interface CatalogPlayerProps {
  slides: CatalogSlide[];
  mode: CatalogPlayerMode;
  featured?: boolean;
  playbackActive?: boolean;
  paused?: boolean;
  onExpand?: (index: number) => void;
  onClose?: () => void;
}

function resolveSrc(slide: CatalogSlide, enabled: boolean) {
  if (!enabled) return '';
  return resolveMediaUrl(slide.id, slide.src);
}

function MediaImage({
  slide,
  eager,
  animateLayout,
  transition,
}: {
  slide: CatalogSlide;
  eager: boolean;
  animateLayout: boolean;
  transition: Transition;
}) {
  const src = resolveSrc(slide, eager);
  if (!src) return <div className="h-full w-full bg-neutral-900" aria-hidden />;
  return (
    <motion.img
      src={src}
      alt={slide.alt ?? slide.title ?? ''}
      className="h-full w-full object-cover"
      draggable={false}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      layout={animateLayout}
      transition={transition}
    />
  );
}

function MediaVideo({
  slide,
  active,
  eager,
  animateLayout,
  transition,
  videoRef,
}: {
  slide: CatalogSlide;
  active: boolean;
  eager: boolean;
  animateLayout: boolean;
  transition: Transition;
  videoRef: React.MutableRefObject<HTMLVideoElement | null>;
}) {
  const src = resolveSrc(slide, eager);
  const localRef = useRef<HTMLVideoElement | null>(null);

  const setRefs = useCallback(
    (node: HTMLVideoElement | null) => {
      localRef.current = node;
      if (active) videoRef.current = node;
    },
    [active, videoRef]
  );

  useEffect(() => {
    const video = localRef.current;
    if (!video || !src || active) return;
    const paint = () => {
      try {
        if (video.currentTime < 0.05) video.currentTime = 0.08;
      } catch {
        /* ignore */
      }
    };
    if (video.readyState >= 1) paint();
    else {
      video.addEventListener('loadedmetadata', paint, { once: true });
      return () => video.removeEventListener('loadedmetadata', paint);
    }
  }, [src, active]);

  if (!src) return <div className="h-full w-full bg-neutral-900" aria-hidden />;

  return (
    <motion.video
      ref={setRefs}
      src={src}
      className="h-full w-full object-cover"
      muted
      playsInline
      preload={eager ? 'auto' : 'metadata'}
      layout={animateLayout}
      transition={transition}
    />
  );
}

const CatalogPlayer = ({
  slides,
  mode,
  featured = false,
  playbackActive = true,
  paused = false,
  onExpand,
  onClose,
}: CatalogPlayerProps) => {
  const isFullscreen = mode === 'fullscreen';
  const canPlay = playbackActive && !paused;
  const [api, setApi] = useState<CarouselApi>();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [chromeVisible, setChromeVisible] = useState(true);
  const [hintVisible, setHintVisible] = useState(true);
  // true durante o FLIP de abertura/fechamento do fullscreen: mantém chrome,
  // hint e overlay de título/progresso ocultos para que nada "salte" antes
  // do fim da animação, e adia o reInit do Embla até o layout se estabilizar.
  const [isTransitioning, setIsTransitioning] = useState(false);
  const reduceMotion = useReducedMotion() || prefersReducedMotion();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const selectedIndexRef = useRef(0);
  const mediaArmedForRef = useRef<number | null>(null);
  const imageStartedAtRef = useRef<number | null>(null);
  const frozenProgressRef = useRef(0);
  const rafRef = useRef<number>();
  const chromeHideTimer = useRef<ReturnType<typeof setTimeout>>();
  const hintHideTimer = useRef<ReturnType<typeof setTimeout>>();
  const transitionTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const pointerStart = useRef<{ x: number; y: number } | null>(null);
  const prevFullscreenRef = useRef(isFullscreen);
  const autoplayRef = useRef<AutoplayType>(
    Autoplay({ delay: IMAGE_SLIDE_MS, stopOnInteraction: false })
  );

  const slidesKey = slides.map((s) => s.id).join('|');
  selectedIndexRef.current = selectedIndex;

  const transition = reduceMotion ? INSTANT_TRANSITION : FULLSCREEN_TRANSITION;

  // useLayoutEffect (não useEffect): precisa aplicar isTransitioning=true
  // ANTES do primeiro paint do novo `mode`, senão o navegador chega a pintar
  // um frame com o container já `absolute` (contido/cortado pelo wrapper
  // `overflow-hidden` da coleção) antes do wrapper trocar para
  // `overflow-visible` (ver className do wrapper no return).
  useLayoutEffect(() => {
    if (prevFullscreenRef.current === isFullscreen) return;
    prevFullscreenRef.current = isFullscreen;
    if (reduceMotion) return;
    setIsTransitioning(true);
    // Fallback determinístico: `onLayoutAnimationComplete` do `motion` nem
    // sempre dispara de forma confiável para este container (projection
    // aninhada com a mídia + re-renders contínuos da barra de progresso).
    // Sem isso, `isTransitioning` pode ficar travado em `true` para sempre —
    // escondendo o chrome permanentemente e travando o botão de voltar, o
    // que é crítico no tablet (sem teclado/Escape). O timeout usa a duração
    // real da transição + margem e é cancelado se o callback do `motion`
    // chegar a disparar primeiro (ver `handleLayoutAnimationComplete`).
    if (transitionTimeoutRef.current !== undefined) {
      clearTimeout(transitionTimeoutRef.current);
    }
    const durationMs = (transition.duration ?? 0.56) * 1000;
    transitionTimeoutRef.current = setTimeout(() => {
      transitionTimeoutRef.current = undefined;
      handleLayoutAnimationCompleteRef.current();
    }, durationMs + 120);
    return () => {
      if (transitionTimeoutRef.current !== undefined) {
        clearTimeout(transitionTimeoutRef.current);
        transitionTimeoutRef.current = undefined;
      }
    };
  }, [isFullscreen, reduceMotion, transition]);

  const revealChrome = useCallback(() => {
    if (!isFullscreen || !onClose || isTransitioning) return;
    setChromeVisible(true);
    if (chromeHideTimer.current !== undefined) clearTimeout(chromeHideTimer.current);
    if (reduceMotion) return;
    chromeHideTimer.current = setTimeout(() => setChromeVisible(false), CHROME_HIDE_MS);
  }, [isFullscreen, isTransitioning, onClose, reduceMotion]);

  const revealChromeRef = useRef(revealChrome);
  revealChromeRef.current = revealChrome;

  const handleLayoutAnimationComplete = useCallback(() => {
    if (transitionTimeoutRef.current !== undefined) {
      clearTimeout(transitionTimeoutRef.current);
      transitionTimeoutRef.current = undefined;
    }
    setIsTransitioning(false);
    if (api) api.reInit();
    if (isFullscreen) revealChromeRef.current();
  }, [api, isFullscreen]);

  const handleLayoutAnimationCompleteRef = useRef(handleLayoutAnimationComplete);
  handleLayoutAnimationCompleteRef.current = handleLayoutAnimationComplete;

  useEffect(() => {
    if (!isFullscreen || isTransitioning) return;
    revealChrome();
    return () => {
      if (chromeHideTimer.current !== undefined) clearTimeout(chromeHideTimer.current);
    };
  }, [isFullscreen, isTransitioning, revealChrome]);

  // Fallback: se o reduced-motion pular a animação (sem onLayoutAnimationComplete
  // relevante) garante que o Embla ainda recalcule as dimensões do slide.
  useEffect(() => {
    if (!api || !reduceMotion) return;
    const id = requestAnimationFrame(() => api.reInit());
    return () => cancelAnimationFrame(id);
  }, [api, isFullscreen, reduceMotion]);

  useEffect(() => {
    if (!isFullscreen || !onClose) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isFullscreen, onClose]);

  useEffect(() => {
    if (isFullscreen || prefersReducedMotion()) {
      setHintVisible(false);
      return;
    }
    setHintVisible(true);
    if (hintHideTimer.current !== undefined) clearTimeout(hintHideTimer.current);
    hintHideTimer.current = setTimeout(() => setHintVisible(false), HINT_HIDE_MS);
    return () => {
      if (hintHideTimer.current !== undefined) clearTimeout(hintHideTimer.current);
    };
  }, [isFullscreen, slidesKey]);

  useEffect(() => {
    mediaArmedForRef.current = null;
    imageStartedAtRef.current = null;
    frozenProgressRef.current = 0;
    setSelectedIndex(0);
    selectedIndexRef.current = 0;
    setProgress(0);
  }, [slidesKey]);

  useEffect(() => {
    if (!api) return;
    const onSelect = () => {
      const next = api.selectedScrollSnap();
      if (next === selectedIndexRef.current) return;
      mediaArmedForRef.current = null;
      imageStartedAtRef.current = null;
      frozenProgressRef.current = 0;
      selectedIndexRef.current = next;
      setSelectedIndex(next);
      setProgress(0);
    };
    api.on('select', onSelect);
    onSelect();
    return () => {
      api.off('select', onSelect);
    };
  }, [api]);

  const stopProgress = useCallback(() => {
    if (rafRef.current !== undefined) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = undefined;
    }
  }, []);

  useEffect(() => {
    if (!api || slides.length === 0) return;
    const slide = slides[selectedIndex];
    if (!slide) return;

    if (!canPlay) {
      autoplayRef.current.stop();
      stopProgress();
      videoRef.current?.pause();
      return;
    }

    const autoplay = autoplayRef.current;
    const fresh = mediaArmedForRef.current !== selectedIndex;

    if (slide.type === 'image') {
      if (fresh) {
        mediaArmedForRef.current = selectedIndex;
        autoplay.reset();
        autoplay.play();
        imageStartedAtRef.current = performance.now();
        frozenProgressRef.current = 0;
      } else if (!autoplay.isPlaying()) {
        autoplay.play();
      }
      const startedAt =
        imageStartedAtRef.current ??
        performance.now() - frozenProgressRef.current * IMAGE_SLIDE_MS;
      imageStartedAtRef.current = startedAt;
      stopProgress();
      const tick = () => {
        const next = Math.min(1, (performance.now() - startedAt) / IMAGE_SLIDE_MS);
        frozenProgressRef.current = next;
        setProgress(next);
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
      return () => stopProgress();
    }

    autoplay.stop();
    const video = videoRef.current;
    if (!video) return;

    if (fresh) {
      video.currentTime = 0;
      mediaArmedForRef.current = selectedIndex;
      frozenProgressRef.current = 0;
    }

    const onEnded = () => {
      mediaArmedForRef.current = null;
      if (api.canScrollNext()) api.scrollNext();
      else api.scrollTo(0);
    };
    const onLoaded = () => {
      void video.play().catch(() => {});
      stopProgress();
      const tick = () => {
        if (video.duration && Number.isFinite(video.duration)) {
          const next = video.currentTime / video.duration;
          frozenProgressRef.current = next;
          setProgress(next);
        }
        if (!video.paused && !video.ended) {
          rafRef.current = requestAnimationFrame(tick);
        }
      };
      rafRef.current = requestAnimationFrame(tick);
    };

    video.addEventListener('ended', onEnded);
    if (video.readyState >= 1) onLoaded();
    else video.addEventListener('loadedmetadata', onLoaded, { once: true });

    return () => {
      video.removeEventListener('ended', onEnded);
      video.removeEventListener('loadedmetadata', onLoaded);
      stopProgress();
      if (selectedIndexRef.current !== selectedIndex) video.pause();
    };
  }, [api, slides, selectedIndex, canPlay, stopProgress]);

  useEffect(() => () => stopProgress(), [stopProgress]);

  const onPointerDown = (e: ReactPointerEvent) => {
    if (!onExpand || isFullscreen || isTransitioning) return;
    pointerStart.current = { x: e.clientX, y: e.clientY };
  };

  const onPointerUp = (e: ReactPointerEvent) => {
    if (!onExpand || isFullscreen || isTransitioning || !pointerStart.current) return;
    const dx = Math.abs(e.clientX - pointerStart.current.x);
    const dy = Math.abs(e.clientY - pointerStart.current.y);
    pointerStart.current = null;
    if (dx <= CLICK_DRAG_THRESHOLD_PX && dy <= CLICK_DRAG_THRESHOLD_PX) {
      onExpand(selectedIndex);
    }
  };

  const shellHeight = featured
    ? 'h-[min(82dvh,58rem)] landscape:h-[min(88dvh,36rem)] short-landscape:h-[min(92dvh,28rem)]'
    : 'h-[min(58dvh,42rem)] landscape:h-[min(70dvh,28rem)] short-landscape:h-[min(78dvh,22rem)]';
  const activeSlide = slides[selectedIndex];
  const showChrome = isFullscreen && !!onClose;

  if (slides.length === 0) {
    return (
      <div
        className={cn(
          'flex w-full flex-col items-center justify-center gap-3 bg-black text-white',
          shellHeight
        )}
      >
        <p className="font-light tracking-wide text-white/80">
          Nenhuma mídia nesta coleção.
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative w-full bg-neutral-200',
        // Durante o FLIP de fechamento o `motion.div` filho passa a
        // `position: absolute` (sai de `fixed`) e é escalado via transform
        // para simular o tamanho de tela cheia enquanto encolhe até este
        // slot. Se este wrapper permanecesse `overflow-hidden` durante a
        // transição, esse recorte cortaria a mídia antes do fim da
        // animação (clipping). `overflow-visible` some só nesse período;
        // volta a `overflow-hidden` (crop normal do card) assim que
        // `onLayoutAnimationComplete` assenta o layout final.
        isTransitioning ? 'overflow-visible' : 'overflow-hidden',
        shellHeight
      )}
      role="region"
      aria-roledescription="carrossel"
      aria-label="Deslize para navegar. Toque para ver em tela cheia."
    >
      <motion.div
        layout
        transition={transition}
        onLayoutAnimationComplete={handleLayoutAnimationComplete}
        className={cn(
          'zue-catalog-surface overflow-hidden overscroll-none bg-black',
          isFullscreen ? 'fixed inset-0 z-[100]' : 'absolute inset-0'
        )}
        onPointerMove={showChrome ? revealChrome : undefined}
        onPointerDownCapture={
          showChrome ? () => revealChrome() : onPointerDown
        }
        onPointerUpCapture={!isFullscreen ? onPointerUp : undefined}
        onPointerCancelCapture={() => {
          pointerStart.current = null;
        }}
      >
        {showChrome && (
          <div
            className={cn(
              'pointer-events-none absolute inset-x-0 top-0 z-30 flex justify-start px-[max(1.25rem,env(safe-area-inset-left))] pt-[max(1.25rem,env(safe-area-inset-top))] transition-opacity duration-300',
              chromeVisible && !isTransitioning ? 'opacity-100' : 'opacity-0'
            )}
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Voltar ao catálogo"
              className={cn(
                'pointer-events-auto flex size-11 min-h-11 min-w-11 touch-manipulation items-center justify-center rounded-none',
                'bg-black/40 text-white/90 backdrop-blur-sm transition-colors',
                'hover:bg-black/55 hover:text-white active:bg-black/65 active:text-white',
                (!chromeVisible || isTransitioning) && 'pointer-events-none'
              )}
            >
              <ArrowLeft className="size-5" strokeWidth={1.25} />
            </button>
          </div>
        )}

        {!isFullscreen && onExpand && (
          <div
            className={cn(
              'pointer-events-none absolute inset-x-0 top-0 z-30 flex items-start justify-between px-[max(1rem,env(safe-area-inset-left))] pt-[max(1rem,env(safe-area-inset-top))] pr-[max(1rem,env(safe-area-inset-right))] transition-opacity duration-500',
              hintVisible && !isTransitioning ? 'opacity-100' : 'opacity-0'
            )}
          >
            <p className="text-[11px] font-light tracking-[0.28em] text-white/70 uppercase">
              Deslize · toque para ampliar
            </p>
            <Maximize2 className="size-4 text-white/65" strokeWidth={1.25} aria-hidden />
          </div>
        )}

        <Carousel
          key={slidesKey}
          setApi={setApi}
          plugins={[autoplayRef.current]}
          opts={{ loop: true, duration: 28, dragFree: false }}
          className="h-full w-full overflow-hidden"
        >
          <CarouselContent className="ml-0 h-full">
            {slides.map((slide, index) => {
              const near =
                Math.abs(index - selectedIndex) <= 1 ||
                (selectedIndex === 0 && index === slides.length - 1) ||
                (selectedIndex === slides.length - 1 && index === 0);

              const eager = (canPlay && near) || isFullscreen;

              return (
                <CarouselItem
                  key={slide.id}
                  className="relative h-full basis-full overflow-hidden pl-0"
                >
                  {slide.type === 'image' ? (
                    <MediaImage
                      slide={slide}
                      eager={eager}
                      animateLayout={eager}
                      transition={transition}
                    />
                  ) : (
                    <MediaVideo
                      slide={slide}
                      active={index === selectedIndex}
                      eager={eager}
                      animateLayout={eager}
                      transition={transition}
                      videoRef={videoRef}
                    />
                  )}
                </CarouselItem>
              );
            })}
          </CarouselContent>
        </Carousel>

        <div
          className={cn(
            'pointer-events-none absolute inset-x-0 bottom-0 z-20 pb-safe transition-opacity duration-300',
            isTransitioning ? 'opacity-0' : 'opacity-100'
          )}
        >
          {activeSlide?.title ? (
            <p
              className={cn(
                'px-4 text-center font-light tracking-[0.32em] text-white/80 uppercase',
                isFullscreen ? 'text-[11px]' : 'text-[10px] sm:text-[11px]',
                slides.length > 1 ? 'mb-3' : 'mb-2'
              )}
            >
              {activeSlide.title}
            </p>
          ) : null}
          {slides.length > 1 && (
            <div className="relative mb-1.5 flex justify-center px-6" aria-hidden>
              <div className="flex h-0.5 w-full max-w-[7.5rem] gap-[2px]">
                {slides.map((s, i) => (
                  <div
                    key={s.id}
                    className={cn(
                      'h-full flex-1 transition-[background-color] duration-300',
                      i === selectedIndex ? 'bg-white/90' : 'bg-white/22'
                    )}
                  />
                ))}
              </div>
            </div>
          )}
          <div className="relative h-px bg-white/15" aria-hidden>
            <div
              className="h-full bg-white/85"
              style={{ width: `${Math.min(100, progress * 100)}%` }}
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CatalogPlayer;
