interface HibernateOverlayProps {
  visible: boolean;
}

const Corner = ({
  className,
  borders,
}: {
  className: string;
  borders: string;
}) => (
  <span
    className={`pointer-events-none absolute size-8 border-black/12 md:size-11 ${borders} ${className}`}
    aria-hidden
  />
);

const HibernateOverlay = ({ visible }: HibernateOverlayProps) => {
  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center overflow-hidden bg-[#f7f7f5] motion-safe:animate-in motion-safe:fade-in-0 motion-safe:duration-700"
      aria-hidden={!visible}
      role="presentation"
    >
      {/* Wash atmosférico — pulsa bem devagar */}
      <div
        className="pointer-events-none absolute inset-0 motion-safe:animate-zue-hibernate-aura"
        aria-hidden
        style={{
          background:
            'radial-gradient(ellipse 58% 42% at 50% 46%, rgb(0 0 0 / 0.045), transparent 72%)',
        }}
      />

      {/* Vinheta suave nas bordas */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background:
            'radial-gradient(ellipse 85% 85% at 50% 50%, transparent 50%, rgb(0 0 0 / 0.045) 100%)',
        }}
      />

      {/* Cantos de galeria — linguagem angular + safe-area */}
      <Corner
        className="top-[max(1.75rem,env(safe-area-inset-top))] left-[max(1.75rem,env(safe-area-inset-left))] md:top-[max(3rem,env(safe-area-inset-top))] md:left-[max(3rem,env(safe-area-inset-left))]"
        borders="border-t border-l"
      />
      <Corner
        className="top-[max(1.75rem,env(safe-area-inset-top))] right-[max(1.75rem,env(safe-area-inset-right))] md:top-[max(3rem,env(safe-area-inset-top))] md:right-[max(3rem,env(safe-area-inset-right))]"
        borders="border-t border-r"
      />
      <Corner
        className="bottom-[max(1.75rem,env(safe-area-inset-bottom))] left-[max(1.75rem,env(safe-area-inset-left))] md:bottom-[max(3rem,env(safe-area-inset-bottom))] md:left-[max(3rem,env(safe-area-inset-left))]"
        borders="border-b border-l"
      />
      <Corner
        className="right-[max(1.75rem,env(safe-area-inset-right))] bottom-[max(1.75rem,env(safe-area-inset-bottom))] md:right-[max(3rem,env(safe-area-inset-right))] md:bottom-[max(3rem,env(safe-area-inset-bottom))]"
        borders="border-r border-b"
      />

      {/* Composição central */}
      <div className="relative z-10 flex flex-col items-center px-8 text-center short-landscape:scale-90">
        <h1 className="font-heading text-5xl font-light tracking-[0.42em] text-black motion-safe:animate-zue-hibernate-mark md:text-7xl md:tracking-[0.48em] short-landscape:text-4xl">
          ZUE
        </h1>

        <div className="mt-9 flex items-center gap-4 md:mt-11 md:gap-5 short-landscape:mt-5">
          <span
            className="h-px w-7 bg-black/15 motion-safe:animate-zue-hibernate-rule md:w-10"
            aria-hidden
          />
          <p className="font-sans text-[11px] font-light tracking-[0.38em] text-black/40 uppercase md:text-xs md:tracking-[0.42em]">
            Elegância Atemporal
          </p>
          <span
            className="h-px w-7 bg-black/15 motion-safe:animate-zue-hibernate-rule md:w-10"
            style={{ animationDelay: '1.2s' }}
            aria-hidden
          />
        </div>
      </div>

      <p className="absolute bottom-[max(2.5rem,calc(env(safe-area-inset-bottom)+1.25rem))] left-1/2 -translate-x-1/2 font-sans text-[11px] font-light tracking-[0.4em] text-black/22 uppercase md:text-xs">
        Toque para continuar
      </p>
    </div>
  );
};

export default HibernateOverlay;
