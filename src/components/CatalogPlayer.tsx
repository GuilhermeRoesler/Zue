import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import Autoplay from 'embla-carousel-autoplay';
import type { AutoplayType } from 'embla-carousel-autoplay';
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

function MediaImage({ slide, eager }: { slide: CatalogSlide; eager: boolean }) {
  const src = resolveSrc(slide, eager);
  if (!src) return <div className="h-full w-full bg-neutral-900" aria-hidden />;
  return (
    <img
      src={src}
      alt={slide.alt ?? slide.title ?? ''}
      className="h-full w-full object-cover"
      draggable={false}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
    />
  );
}

function MediaVideo({
  slide,
  active,
  eager,
  videoRef,
}: {
  slide: CatalogSlide;
  active: boolean;
  eager: boolean;
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
    <video
      ref={setRefs}
      src={src}
      className="h-full w-full object-cover"
      muted
      playsInline
      preload={eager ? 'auto' : 'metadata'}
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

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const selectedIndexRef = useRef(0);
  const mediaArmedForRef = useRef<number | null>(null);
  const imageStartedAtRef = useRef<number | null>(null);
  const frozenProgressRef = useRef(0);
  const rafRef = useRef<number>();
  const chromeHideTimer = useRef<ReturnType<typeof setTimeout>>();
  const hintHideTimer = useRef<ReturnType<typeof setTimeout>>();
  const pointerStart = useRef<{ x: number; y: number } | null>(null);
  const autoplayRef = useRef<AutoplayType>(
    Autoplay({ delay: IMAGE_SLIDE_MS, stopOnInteraction: false })
  );

  const slidesKey = slides.map((s) => s.id).join('|');
  selectedIndexRef.current = selectedIndex;

  useEffect(() => {
    if (!api || !isFullscreen) return;
    const id = requestAnimationFrame(() => api.reInit());
    return () => cancelAnimationFrame(id);
  }, [api, isFullscreen]);

  const revealChrome = useCallback(() => {
    if (!isFullscreen || !onClose) return;
    setChromeVisible(true);
    if (chromeHideTimer.current !== undefined) clearTimeout(chromeHideTimer.current);
    if (prefersReducedMotion()) return;
    chromeHideTimer.current = setTimeout(() => setChromeVisible(false), CHROME_HIDE_MS);
  }, [isFullscreen, onClose]);

  useEffect(() => {
    if (!isFullscreen) return;
    revealChrome();
    return () => {
      if (chromeHideTimer.current !== undefined) clearTimeout(chromeHideTimer.current);
    };
  }, [isFullscreen, revealChrome]);

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
    if (!onExpand || isFullscreen) return;
    pointerStart.current = { x: e.clientX, y: e.clientY };
  };

  const onPointerUp = (e: ReactPointerEvent) => {
    if (!onExpand || isFullscreen || !pointerStart.current) return;
    const dx = Math.abs(e.clientX - pointerStart.current.x);
    const dy = Math.abs(e.clientY - pointerStart.current.y);
    pointerStart.current = null;
    if (dx <= CLICK_DRAG_THRESHOLD_PX && dy <= CLICK_DRAG_THRESHOLD_PX) {
      onExpand(selectedIndex);
    }
  };

  const shellHeight = featured
    ? 'h-[min(82dvh,58rem)]'
    : 'h-[min(58dvh,42rem)]';
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
      className={cn('relative w-full overflow-hidden bg-neutral-200', shellHeight)}
      role="region"
      aria-roledescription="carrossel"
      aria-label="Deslize para navegar. Toque para ver em tela cheia."
    >
      <div
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

        {!isFullscreen && onExpand && (
          <div
            className={cn(
              'pointer-events-none absolute inset-x-0 top-0 z-30 flex items-start justify-between p-4 transition-opacity duration-500',
              hintVisible ? 'opacity-100' : 'opacity-0'
            )}
          >
            <p className="text-[10px] font-light tracking-[0.28em] text-white/70 uppercase">
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

              return (
                <CarouselItem
                  key={slide.id}
                  className="relative h-full basis-full overflow-hidden pl-0"
                >
                  {slide.type === 'image' ? (
                    <MediaImage slide={slide} eager={(canPlay && near) || isFullscreen} />
                  ) : (
                    <MediaVideo
                      slide={slide}
                      active={index === selectedIndex}
                      eager={(canPlay && near) || isFullscreen}
                      videoRef={videoRef}
                    />
                  )}
                </CarouselItem>
              );
            })}
          </CarouselContent>
        </Carousel>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20">
          {activeSlide?.title ? (
            <p
              className={cn(
                'px-4 text-center font-light tracking-[0.32em] text-white/80 uppercase',
                isFullscreen ? 'text-[10px]' : 'text-[9px] sm:text-[10px]',
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
      </div>
    </div>
  );
};

export default CatalogPlayer;
