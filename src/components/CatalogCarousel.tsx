import { useCallback, useEffect, useRef, useState } from 'react';
import Autoplay from 'embla-carousel-autoplay';
import type { AutoplayType } from 'embla-carousel-autoplay';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel';
import type { CatalogSlide } from '@/data/catalog-slides';
import { IMAGE_SLIDE_MS } from '@/lib/idle-config';
import { cn } from '@/lib/utils';

interface CatalogCarouselProps {
  slides: CatalogSlide[];
  paused?: boolean;
  onNavigateHome?: () => void;
  /** Pressione a logo ~1s para abrir configuração de pasta (gerente). */
  onLogoLongPress?: () => void;
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

const LONG_PRESS_MS = 1000;

const CatalogCarousel = ({
  slides,
  paused = false,
  onNavigateHome,
  onLogoLongPress,
}: CatalogCarouselProps) => {
  const [api, setApi] = useState<CarouselApi>();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const autoplayRef = useRef<AutoplayType>(
    Autoplay({ delay: IMAGE_SLIDE_MS, stopOnInteraction: false })
  );
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const rafRef = useRef<number>();
  const longPressTimer = useRef<ReturnType<typeof setTimeout>>();
  const longPressFired = useRef(false);

  const clearLongPress = useCallback(() => {
    if (longPressTimer.current !== undefined) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = undefined;
    }
  }, []);

  const startLongPress = useCallback(() => {
    clearLongPress();
    longPressFired.current = false;
    if (!onLogoLongPress) return;
    longPressTimer.current = setTimeout(() => {
      longPressFired.current = true;
      onLogoLongPress();
    }, LONG_PRESS_MS);
  }, [clearLongPress, onLogoLongPress]);

  const handleLogoClick = useCallback(() => {
    if (longPressFired.current) {
      longPressFired.current = false;
      return;
    }
    onNavigateHome?.();
  }, [onNavigateHome]);

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

  useEffect(() => {
    setSelectedIndex(0);
    setProgress(0);
    api?.scrollTo(0, true);
  }, [slides, api]);

  useEffect(() => {
    if (!api) return;

    const onSelect = () => {
      setSelectedIndex(api.selectedScrollSnap());
      setProgress(0);
    };

    api.on('select', onSelect);
    onSelect();

    return () => {
      api.off('select', onSelect);
    };
  }, [api]);

  useEffect(() => {
    if (!api || slides.length === 0) return;

    const slide = slides[selectedIndex];
    if (!slide) return;

    if (paused) {
      autoplayRef.current.stop();
      stopProgressLoop();
      if (slide.type === 'video' && videoRef.current) {
        videoRef.current.pause();
      }
      return;
    }

    const autoplay = autoplayRef.current;

    if (slide.type === 'image') {
      autoplay.reset();
      autoplay.play();
      startImageProgress();

      return () => {
        autoplay.stop();
        stopProgressLoop();
      };
    }

    autoplay.stop();
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = 0;

    const onEnded = () => {
      if (api.canScrollNext()) {
        api.scrollNext();
      } else {
        api.scrollTo(0);
      }
    };

    const onLoaded = () => {
      void video.play().catch(() => {});
      startVideoProgress(video);
    };

    video.addEventListener('ended', onEnded);
    if (video.readyState >= 1) {
      onLoaded();
    } else {
      video.addEventListener('loadedmetadata', onLoaded, { once: true });
    }

    return () => {
      video.pause();
      video.removeEventListener('ended', onEnded);
      video.removeEventListener('loadedmetadata', onLoaded);
      stopProgressLoop();
    };
  }, [
    api,
    slides,
    selectedIndex,
    paused,
    startImageProgress,
    startVideoProgress,
    stopProgressLoop,
  ]);

  useEffect(() => () => stopProgressLoop(), [stopProgressLoop]);
  useEffect(() => () => clearLongPress(), [clearLongPress]);

  if (slides.length === 0) {
    return (
      <div className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-4 bg-black text-white">
        <p className="font-light tracking-wide text-white/80">
          Nenhuma mídia na pasta.
        </p>
        {onLogoLongPress && (
          <button
            type="button"
            onClick={onLogoLongPress}
            className="font-light tracking-wide text-sm text-white/60 underline-offset-4 hover:text-white hover:underline"
          >
            Configurar pasta
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-40 bg-black">
      {(onNavigateHome || onLogoLongPress) && (
        <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex justify-center p-5">
          <button
            type="button"
            onClick={handleLogoClick}
            onPointerDown={startLongPress}
            onPointerUp={clearLongPress}
            onPointerLeave={clearLongPress}
            onPointerCancel={clearLongPress}
            className="pointer-events-auto select-none font-heading text-xl font-light tracking-[0.35em] text-white/90 transition-opacity hover:text-white"
          >
            ZUE
          </button>
        </div>
      )}

      <Carousel
        key={slides.map((s) => s.id).join('|')}
        setApi={setApi}
        plugins={[autoplayRef.current]}
        opts={{ loop: true, duration: 28 }}
        className="h-full w-full"
      >
        <CarouselContent className="ml-0 h-full">
          {slides.map((slide, index) => (
            <CarouselItem
              key={slide.id}
              className="relative h-[100dvh] basis-full pl-0"
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

              {slide.title && (
                <p
                  className={cn(
                    'absolute inset-x-0 bottom-2 z-10 text-center text-[10px] font-light tracking-[0.35em] text-white/75 uppercase',
                    'pointer-events-none'
                  )}
                >
                  {slide.title}
                </p>
              )}

              {index === selectedIndex && <SlideProgressBar progress={progress} />}
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
};

export default CatalogCarousel;
