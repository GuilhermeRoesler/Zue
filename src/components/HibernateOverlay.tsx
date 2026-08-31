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

      {/* Cantos de galeria — linguagem angular da marca */}
      <Corner className="top-7 left-7 md:top-12 md:left-12" borders="border-t border-l" />
      <Corner className="top-7 right-7 md:top-12 md:right-12" borders="border-t border-r" />
      <Corner className="bottom-7 left-7 md:bottom-12 md:left-12" borders="border-b border-l" />
      <Corner className="right-7 bottom-7 md:right-12 md:bottom-12" borders="border-r border-b" />

      {/* Composição central */}
      <div className="relative z-10 flex flex-col items-center px-8 text-center">
        <h1 className="font-heading text-5xl font-light tracking-[0.42em] text-black motion-safe:animate-zue-hibernate-mark md:text-7xl md:tracking-[0.48em]">
          ZUE
        </h1>

        <div className="mt-9 flex items-center gap-4 md:mt-11 md:gap-5">
          <span
            className="h-px w-7 bg-black/15 motion-safe:animate-zue-hibernate-rule md:w-10"
            aria-hidden
          />
          <p className="font-sans text-[10px] font-light tracking-[0.38em] text-black/40 uppercase md:text-xs md:tracking-[0.42em]">
            Elegância Atemporal
          </p>
          <span
            className="h-px w-7 bg-black/15 motion-safe:animate-zue-hibernate-rule md:w-10"
            style={{ animationDelay: '1.2s' }}
            aria-hidden
          />
        </div>
      </div>

      <p className="absolute bottom-10 left-1/2 -translate-x-1/2 font-sans text-[9px] font-light tracking-[0.4em] text-black/22 uppercase md:bottom-14 md:text-[10px]">
        Toque para continuar
      </p>
    </div>
  );
};

export default HibernateOverlay;
