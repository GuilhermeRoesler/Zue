import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import Autoplay from 'embla-carousel-autoplay';
import type { AutoplayType } from 'embla-carousel-autoplay';
import { ArrowLeft } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel';
import type { CatalogSlide } from '@/data/catalog-slides';
import { IMAGE_SLIDE_MS } from '@/lib/idle-config';
import { prefersReducedMotion } from '@/lib/motion';
import { cn } from '@/lib/utils';

export type CatalogPlayerMode = 'embedded' | 'fullscreen';

interface CatalogPlayerProps {
  slides: CatalogSlide[];
  mode: CatalogPlayerMode;
  /** Só para sheet/modais — hibernate e scroll NÃO pausam. */
  paused?: boolean;
  /** Embedded: clique (sem drag) abre fullscreen. */
  onExpand?: (index: number) => void;
  /** Fullscreen: solicitar fechar (pai anima e volta a embedded). */
  onClose?: () => void;
  /** Classe de animação de entrada/saída do fullscreen (pai controla). */
  fullscreenMotionClass?: string;
}

function SlideProgressBar({ progress }: { progress: number }) {
  return (
    <div
      className="absolute inset-x-0 bottom-0 z-20 h-0.5 bg-white/20"
      aria-hidden
    >
      <div
        className="h-full bg-white transition-none"
        style={{ width: `${Math.min(100, progress * 100)}%` }}
      />
    </div>
  );
}

const CHROME_HIDE_MS = 2000;
const CLICK_DRAG_THRESHOLD_PX = 8;

const CatalogPlayer = ({
  slides,
  mode,
  paused = false,
  onExpand,
  onClose,
  fullscreenMotionClass,
}: CatalogPlayerProps) => {
  const isFullscreen = mode === 'fullscreen';
  const [api, setApi] = useState<CarouselApi>();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [chromeVisible, setChromeVisible] = useState(true);

  const autoplayRef = useRef<AutoplayType>(
    Autoplay({ delay: IMAGE_SLIDE_MS, stopOnInteraction: false })
  );
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const rafRef = useRef<number>();
  const chromeHideTimer = useRef<ReturnType<typeof setTimeout>>();
  const pointerStart = useRef<{ x: number; y: number } | null>(null);
  const selectedIndexRef = useRef(0);
  /** Índice cuja mídia já foi “armada” (evita seek/restart no mesmo slide). */
  const mediaArmedForRef = useRef<number | null>(null);
  const slidesKey = slides.map((s) => s.id).join('|');

  selectedIndexRef.current = selectedIndex;

  const stopProgressLoop = useCallback(() => {
    if (rafRef.current !== undefined) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = undefined;
    }
  }, []);

  const startImageProgress = useCallback(() => {
    stopProgressLoop();
    const startedAt = performance.now();

    const tick = () => {
      const elapsed = performance.now() - startedAt;
      setProgress(Math.min(1, elapsed / IMAGE_SLIDE_MS));
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
  }, [stopProgressLoop]);

  const startVideoProgress = useCallback(
    (video: HTMLVideoElement) => {
      stopProgressLoop();

      const tick = () => {
        if (video.duration && Number.isFinite(video.duration)) {
          setProgress(video.currentTime / video.duration);
        }
        if (!video.paused && !video.ended) {
          rafRef.current = requestAnimationFrame(tick);
        }
      };

      rafRef.current = requestAnimationFrame(tick);
    },
    [stopProgressLoop]
  );

  const startImageProgressRef = useRef(startImageProgress);
  const startVideoProgressRef = useRef(startVideoProgress);
  const stopProgressLoopRef = useRef(stopProgressLoop);
  startImageProgressRef.current = startImageProgress;
  startVideoProgressRef.current = startVideoProgress;
  stopProgressLoopRef.current = stopProgressLoop;
  const slidesRef = useRef(slides);
  slidesRef.current = slides;

  const revealChrome = useCallback(() => {
    if (!isFullscreen || !onClose) return;
    setChromeVisible(true);
    if (chromeHideTimer.current !== undefined) {
      clearTimeout(chromeHideTimer.current);
    }
    if (prefersReducedMotion()) return;
    chromeHideTimer.current = setTimeout(() => {
      setChromeVisible(false);
    }, CHROME_HIDE_MS);
  }, [isFullscreen, onClose]);

  useEffect(() => {
    if (!isFullscreen) return;
    revealChrome();
    return () => {
      if (chromeHideTimer.current !== undefined) {
        clearTimeout(chromeHideTimer.current);
      }
    };
  }, [isFullscreen, revealChrome]);

  useEffect(() => {
    mediaArmedForRef.current = null;
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

  useEffect(() => {
    if (!api || slidesRef.current.length === 0) return;

    const currentSlides = slidesRef.current;
    const slide = currentSlides[selectedIndex];
    if (!slide) return;

    if (paused) {
      autoplayRef.current.stop();
      stopProgressLoopRef.current();
      videoRef.current?.pause();
      return;
    }

    const autoplay = autoplayRef.current;
    const isFresh = mediaArmedForRef.current !== selectedIndex;

    if (slide.type === 'image') {
      if (isFresh) {
        mediaArmedForRef.current = selectedIndex;
        autoplay.reset();
        autoplay.play();
        startImageProgressRef.current();
      } else if (!autoplay.isPlaying()) {
        autoplay.play();
        startImageProgressRef.current();
      }
      return;
    }

    autoplay.stop();
    const video = videoRef.current;
    if (!video) return;

    if (isFresh) {
      video.currentTime = 0;
      mediaArmedForRef.current = selectedIndex;
    }

    const onEnded = () => {
      mediaArmedForRef.current = null;
      if (api.canScrollNext()) {
        api.scrollNext();
      } else {
        api.scrollTo(0);
      }
    };

    const onLoaded = () => {
      void video.play().catch(() => {});
      startVideoProgressRef.current(video);
    };

    video.addEventListener('ended', onEnded);
    if (video.readyState >= 1) {
      onLoaded();
    } else {
      video.addEventListener('loadedmetadata', onLoaded, { once: true });
    }

    return () => {
      video.removeEventListener('ended', onEnded);
      video.removeEventListener('loadedmetadata', onLoaded);
      stopProgressLoopRef.current();
      if (selectedIndexRef.current !== selectedIndex) {
        video.pause();
      }
    };
  }, [api, slidesKey, selectedIndex, paused]);

  useEffect(() => () => stopProgressLoop(), [stopProgressLoop]);

  // Embla precisa recalcular tamanho ao entrar/sair do fullscreen
  useEffect(() => {
    if (!api) return;
    const id = requestAnimationFrame(() => {
      api.reInit();
    });
    return () => cancelAnimationFrame(id);
  }, [api, isFullscreen]);

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!onExpand || isFullscreen) return;
    pointerStart.current = { x: event.clientX, y: event.clientY };
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!onExpand || isFullscreen || !pointerStart.current) return;
    const dx = Math.abs(event.clientX - pointerStart.current.x);
    const dy = Math.abs(event.clientY - pointerStart.current.y);
    pointerStart.current = null;
    if (dx <= CLICK_DRAG_THRESHOLD_PX && dy <= CLICK_DRAG_THRESHOLD_PX) {
      onExpand(selectedIndex);
    }
  };

  const handlePointerCancel = () => {
    pointerStart.current = null;
  };

  if (slides.length === 0) {
    return (
      <div className="flex h-[min(70dvh,52rem)] w-full flex-col items-center justify-center gap-4 bg-black text-white">
        <p className="font-light tracking-wide text-white/80">
          Nenhuma mídia nesta coleção.
        </p>
      </div>
    );
  }

  return (
    <div className="relative h-[min(70dvh,52rem)] w-full overflow-hidden">
      <div
        className={cn(
          'overflow-hidden bg-black',
          isFullscreen
            ? cn('fixed inset-0 z-40', fullscreenMotionClass)
            : 'absolute inset-0'
        )}
        onPointerMove={isFullscreen ? revealChrome : undefined}
        onPointerDownCapture={
          isFullscreen ? () => revealChrome() : handlePointerDown
        }
        onPointerUpCapture={!isFullscreen ? handlePointerUp : undefined}
        onPointerCancelCapture={!isFullscreen ? handlePointerCancel : undefined}
      >
        {isFullscreen && onClose && (
          <div
            className={cn(
              'pointer-events-none absolute inset-x-0 top-0 z-30 flex justify-start p-5 transition-opacity duration-300',
              chromeVisible ? 'opacity-100' : 'opacity-0'
            )}
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Voltar ao catálogo"
              className={cn(
                'pointer-events-auto flex size-11 items-center justify-center rounded-none',
                'bg-black/40 text-white/90 backdrop-blur-sm transition-colors',
                'hover:bg-black/55 hover:text-white',
                !chromeVisible && 'pointer-events-none'
              )}
            >
              <ArrowLeft className="size-5" strokeWidth={1.25} />
            </button>
          </div>
        )}

        <Carousel
          key={slidesKey}
          setApi={setApi}
          plugins={[autoplayRef.current]}
          opts={{ loop: true, duration: 28 }}
          className="h-full w-full"
        >
          <CarouselContent className="ml-0 h-full">
            {slides.map((slide, index) => (
              <CarouselItem
                key={slide.id}
                className="relative h-full basis-full overflow-hidden pl-0"
              >
                {slide.type === 'image' ? (
                  <img
                    src={slide.src}
                    alt={slide.alt ?? ''}
                    className="h-full w-full object-cover"
                    draggable={false}
                  />
                ) : (
                  <video
                    ref={index === selectedIndex ? videoRef : undefined}
                    src={slide.src}
                    className="h-full w-full object-cover"
                    muted
                    playsInline
                    preload="metadata"
                  />
                )}

                {isFullscreen && slide.title && (
                  <p
                    className={cn(
                      'absolute inset-x-0 bottom-2 z-10 text-center text-[10px] font-light tracking-[0.35em] text-white/75 uppercase',
                      'pointer-events-none'
                    )}
                  >
                    {slide.title}
                  </p>
                )}

                {index === selectedIndex && (
                  <SlideProgressBar progress={progress} />
                )}
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </div>
  );
};

export default CatalogPlayer;
