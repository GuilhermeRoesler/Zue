import { useMemo } from 'react';
import type { CatalogCollection, CatalogSlide } from '@/data/catalog-slides';
import {
  ABOUT_LEAD,
  ABOUT_PILLARS,
  ABOUT_STORE,
  ABOUT_STORY,
  ABOUT_TAGLINE,
} from '@/data/about';
import Reveal from '@/components/Reveal';
import TextReveal from '@/components/TextReveal';
import { cn } from '@/lib/utils';

interface AboutProps {
  collections: CatalogCollection[];
  onNavigateCatalog: () => void;
}

function firstImageSlide(slides: CatalogSlide[]): CatalogSlide | undefined {
  return slides.find((s) => s.type === 'image') ?? slides[0];
}

/** Hero: preferir 2ª coleção; story: próximo look distinto. */
function pickAboutMedia(collections: CatalogCollection[]): {
  hero?: CatalogSlide;
  story?: CatalogSlide;
} {
  const pool: CatalogSlide[] = [];
  for (const collection of collections) {
    const slide = firstImageSlide(collection.slides);
    if (slide) pool.push(slide);
  }
  for (const collection of collections) {
    for (const slide of collection.slides) {
      if (!pool.some((s) => s.id === slide.id)) pool.push(slide);
    }
  }

  if (pool.length === 0) return {};
  if (pool.length === 1) return { hero: pool[0], story: pool[0] };
  return {
    hero: pool[1] ?? pool[0],
    story: pool[2] ?? pool[0],
  };
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

const About = ({ collections, onNavigateCatalog }: AboutProps) => {
  const { hero: heroSlide, story: storySlide } = useMemo(
    () => pickAboutMedia(collections),
    [collections]
  );

  return (
    <div className="bg-white">
      {/* Marca em primeiro plano — mídia da vitrine */}
      <section
        id="zue-about-hero"
        className="relative flex min-h-dvh items-end overflow-hidden bg-black text-white"
      >
        {heroSlide ? (
          <div className="absolute inset-0" aria-hidden={!heroSlide.alt}>
            <MediaFill
              slide={heroSlide}
              priority
              className="scale-[1.06] motion-safe:animate-zue-hero-drift"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-black/25" />
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
            {ABOUT_TAGLINE}
          </p>

          <h1 className="font-heading text-6xl font-light tracking-[0.28em] text-white sm:text-7xl md:text-8xl">
            <TextReveal text="ZUE" delay={80} as="span" />
          </h1>

          <div className="mt-6 h-px w-14 origin-left bg-white/80 motion-safe:animate-zue-line" />

          <Reveal delay={360} variant="fade" className="mt-6 max-w-md">
            <p className="text-sm font-light leading-relaxed tracking-wide text-white/80 sm:text-base">
              {ABOUT_LEAD}
            </p>
          </Reveal>
        </div>

        <div
          className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2"
          aria-hidden
        >
          <div className="h-10 w-px origin-top bg-white/35 motion-safe:animate-zue-line" />
        </div>
      </section>

      {/* Uma seção, um propósito: essência da marca */}
      <section className="bg-white px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <Reveal className="order-2 space-y-8 lg:order-1">
            <div>
              <p className="text-[10px] font-light tracking-[0.35em] text-gray-500 uppercase">
                {ABOUT_STORY.eyebrow}
              </p>
              <h2 className="mt-3 font-heading text-3xl font-light tracking-[0.12em] text-black sm:text-4xl">
                <TextReveal text={ABOUT_STORY.title} delay={40} as="span" />
              </h2>
            </div>
            <div className="space-y-5">
              {ABOUT_STORY.paragraphs.map((paragraph) => (
                <p
                  key={paragraph}
                  className="max-w-md text-sm font-light leading-relaxed tracking-wide text-gray-600 sm:text-base"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </Reveal>

          <Reveal
            delay={120}
            variant="blur-up"
            className="order-1 lg:order-2"
          >
            <div className="aspect-3/4 overflow-hidden bg-gray-100">
              {storySlide ? (
                <MediaFill slide={storySlide} />
              ) : (
                <div className="h-full w-full bg-linear-to-b from-neutral-200 to-neutral-300" />
              )}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Pilares tipográficos — sem cards */}
      <section className="border-y border-gray-100 bg-gray-50 px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Reveal className="mb-14 sm:mb-16">
            <p className="text-[10px] font-light tracking-[0.35em] text-gray-500 uppercase">
              O que nos guia
            </p>
            <h2 className="mt-3 font-heading text-3xl font-light tracking-[0.12em] text-black sm:text-4xl">
              Pilares
            </h2>
          </Reveal>

          <ul className="grid grid-cols-1 gap-0 md:grid-cols-3">
            {ABOUT_PILLARS.map((pillar, index) => (
              <Reveal key={pillar.title} delay={index * 90}>
                <li
                  className={cn(
                    'border-gray-200 py-8 md:border-l md:px-10 md:py-0',
                    index === 0 && 'md:border-l-0 md:pl-0',
                    index < ABOUT_PILLARS.length - 1 &&
                      'border-b md:border-b-0'
                  )}
                >
                  <h3 className="font-heading text-2xl font-light tracking-[0.08em] text-black">
                    {pillar.title}
                  </h3>
                  <p className="mt-4 max-w-xs text-sm font-light leading-relaxed tracking-wide text-gray-600">
                    {pillar.description}
                  </p>
                </li>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* Info prática da loja — separada da narrativa */}
      <section className="bg-white px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <Reveal className="mb-12 text-center sm:mb-14">
            <p className="text-[10px] font-light tracking-[0.35em] text-gray-500 uppercase">
              Na loja
            </p>
            <h2 className="mt-3 font-heading text-3xl font-light tracking-[0.12em] text-black sm:text-4xl">
              Como funciona
            </h2>
          </Reveal>

          <ul className="divide-y divide-gray-200 border-y border-gray-200">
            {ABOUT_STORE.map((item, index) => (
              <Reveal key={item.title} delay={index * 80}>
                <li className="grid grid-cols-1 gap-2 py-8 sm:grid-cols-[8rem_1fr] sm:items-baseline sm:gap-10">
                  <h3 className="font-heading text-lg font-light tracking-widest text-black">
                    {item.title}
                  </h3>
                  <p className="text-sm font-light leading-relaxed tracking-wide text-gray-600 sm:text-base">
                    {item.description}
                  </p>
                </li>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* Ponte discreta ao catálogo */}
      <section className="border-t border-gray-100 bg-black px-4 py-20 text-white sm:px-6 sm:py-24 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-start gap-8 sm:flex-row sm:items-end sm:justify-between">
          <Reveal>
            <p className="text-[10px] font-light tracking-[0.35em] text-white/55 uppercase">
              Coleções
            </p>
            <h2 className="mt-3 font-heading text-3xl font-light tracking-[0.14em] sm:text-4xl">
              Ver a vitrine
            </h2>
            <p className="mt-4 max-w-sm text-sm font-light leading-relaxed tracking-wide text-white/70">
              Explore as peças em exibição — no ritmo do toque, sem pressa.
            </p>
          </Reveal>

          <Reveal delay={120} variant="fade">
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
      </section>
    </div>
  );
};

export default About;
