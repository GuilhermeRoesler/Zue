import { useMemo } from 'react';
import type { CatalogCollection, CatalogSlide } from '@/data/catalog-slides';
import Reveal from '@/components/Reveal';
import TextReveal from '@/components/TextReveal';
import { cn } from '@/lib/utils';

interface HeroProps {
  collections: CatalogCollection[];
  onNavigateCatalog: () => void;
}

interface FeaturedLook {
  slide: CatalogSlide;
  collectionTitle: string;
}

function firstImageSlide(slides: CatalogSlide[]): CatalogSlide | undefined {
  return slides.find((s) => s.type === 'image') ?? slides[0];
}

/** Até 3 looks: prioriza 1ª imagem de cada coleção; completa com slides seguintes. */
function pickFeaturedLooks(
  collections: CatalogCollection[],
  max = 3
): FeaturedLook[] {
  const looks: FeaturedLook[] = [];
  const seen = new Set<string>();

  for (const collection of collections) {
    const slide = firstImageSlide(collection.slides);
    if (!slide || seen.has(slide.id)) continue;
    seen.add(slide.id);
    looks.push({ slide, collectionTitle: collection.title });
    if (looks.length >= max) return looks;
  }

  for (const collection of collections) {
    for (const slide of collection.slides) {
      if (seen.has(slide.id)) continue;
      if (slide.type !== 'image' && looks.length > 0) continue;
      seen.add(slide.id);
      looks.push({ slide, collectionTitle: collection.title });
      if (looks.length >= max) return looks;
    }
  }

  return looks;
}

function MediaFill({
  slide,
  className,
  priority,
}: {
  slide: CatalogSlide;
  className?: string;
  priority?: boolean;
}) {
  if (slide.type === 'video') {
    return (
      <video
        src={slide.src}
        className={cn('h-full w-full object-cover', className)}
        muted
        playsInline
        autoPlay
        loop
        aria-label={slide.alt ?? slide.title ?? 'Look Zue'}
      />
    );
  }

  return (
    <img
      src={slide.src}
      alt={slide.alt ?? slide.title ?? 'Look Zue'}
      className={cn('h-full w-full object-cover', className)}
      loading={priority ? 'eager' : 'lazy'}
      decoding={priority ? 'sync' : 'async'}
    />
  );
}

const Hero = ({ collections, onNavigateCatalog }: HeroProps) => {
  const featuredLooks = useMemo(
    () => pickFeaturedLooks(collections, 3),
    [collections]
  );
  const heroSlide = featuredLooks[0]?.slide;

  return (
    <div className="bg-white">
      {/* Porta de entrada: marca + imagem full-bleed */}
      <section
        id="zue-home-hero"
        className="relative flex min-h-dvh items-end overflow-hidden bg-black text-white"
      >
        {heroSlide ? (
          <div className="absolute inset-0" aria-hidden={!heroSlide.alt}>
            <MediaFill
              slide={heroSlide}
              priority
              className="scale-[1.06] motion-safe:animate-zue-hero-drift"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/35 to-black/20" />
            <div
              className="pointer-events-none absolute inset-0 opacity-40 motion-safe:animate-zue-wave"
              style={{
                background:
                  'radial-gradient(ellipse 55% 45% at 50% 40%, rgb(255 255 255 / 0.08), transparent 70%)',
              }}
            />
          </div>
        ) : (
          <div className="absolute inset-0 bg-linear-to-b from-neutral-900 to-black" />
        )}

        <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col px-4 pb-16 pt-28 sm:px-6 sm:pb-20 lg:px-8">
          <p className="mb-5 text-[10px] font-light tracking-[0.45em] text-white/70 uppercase motion-safe:animate-fadeIn">
            Elegância Atemporal
          </p>

          <h1 className="font-heading text-6xl font-light tracking-[0.28em] text-white sm:text-7xl md:text-8xl">
            <TextReveal text="ZUE" delay={80} as="span" />
          </h1>

          <div className="mt-6 h-px w-14 origin-left bg-white/80 motion-safe:animate-zue-line" />

          <Reveal delay={360} variant="fade" className="mt-6 max-w-md">
            <p className="text-sm font-light leading-relaxed tracking-wide text-white/80 sm:text-base">
              Peças selecionadas para a mulher que prefere o essencial bem feito.
            </p>
          </Reveal>

          <Reveal delay={480} variant="fade" className="mt-10">
            <button
              type="button"
              onClick={onNavigateCatalog}
              className="group inline-flex items-center gap-3 border border-white/40 bg-transparent px-6 py-3 text-[11px] font-light tracking-[0.32em] text-white uppercase transition-colors duration-300 hover:border-white hover:bg-white hover:text-black"
            >
              Ver catálogo
              <span
                className="inline-block h-px w-6 bg-current transition-all duration-300 group-hover:w-10"
                aria-hidden
              />
            </button>
          </Reveal>
        </div>

        <div
          className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2"
          aria-hidden
        >
          <div className="h-10 w-px origin-top bg-white/35 motion-safe:animate-zue-line" />
        </div>
      </section>

      {/* Looks da vitrine — mesma mídia do catálogo */}
      {featuredLooks.length > 0 && (
        <section className="bg-white px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <Reveal className="mb-12 flex flex-col gap-3 sm:mb-14 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[10px] font-light tracking-[0.35em] text-gray-500 uppercase">
                  Em vitrine
                </p>
                <h2 className="mt-3 font-heading text-3xl font-light tracking-[0.12em] text-black sm:text-4xl">
                  Looks
                </h2>
              </div>
              <button
                type="button"
                onClick={onNavigateCatalog}
                className="self-start text-[11px] font-light tracking-[0.28em] text-gray-500 uppercase underline-offset-4 transition-colors hover:text-black hover:underline sm:self-auto"
              >
                Abrir catálogo
              </button>
            </Reveal>

            <div
              className={cn(
                'grid gap-6 sm:gap-8',
                featuredLooks.length === 1 && 'grid-cols-1',
                featuredLooks.length === 2 && 'grid-cols-1 md:grid-cols-2',
                featuredLooks.length >= 3 && 'grid-cols-1 md:grid-cols-3'
              )}
            >
              {featuredLooks.map((look, index) => (
                <Reveal key={look.slide.id} delay={index * 100}>
                  <button
                    type="button"
                    onClick={onNavigateCatalog}
                    className="group block w-full text-left focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-black"
                  >
                    <div className="aspect-3/4 overflow-hidden bg-gray-100">
                      <MediaFill
                        slide={look.slide}
                        className="transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                    </div>
                    <div className="mt-5 space-y-1">
                      <p className="text-[10px] font-light tracking-[0.3em] text-gray-400 uppercase">
                        {look.collectionTitle}
                      </p>
                      <p className="font-heading text-lg font-light tracking-wide text-black transition-colors duration-300 group-hover:text-gray-600">
                        {look.slide.title ?? look.slide.alt ?? 'Look'}
                      </p>
                    </div>
                  </button>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Hero;
