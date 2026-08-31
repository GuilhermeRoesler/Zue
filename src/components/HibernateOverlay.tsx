interface HibernateOverlayProps {
  visible: boolean;
}

const HibernateOverlay = ({ visible }: HibernateOverlayProps) => {
  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-white motion-safe:animate-in motion-safe:fade-in-0 motion-safe:duration-500"
      aria-hidden={!visible}
      role="presentation"
    >
      <div className="relative flex items-center justify-center">
        <div
          className="absolute size-40 rounded-full border border-black/5 motion-safe:animate-zue-breathe md:size-52"
          aria-hidden
        />
        <div
          className="absolute size-28 rounded-full border border-black/10 motion-safe:animate-zue-breathe md:size-36"
          style={{ animationDelay: '0.6s' }}
          aria-hidden
        />
        <img
          src="/favicon.svg"
          alt=""
          className="relative size-24 motion-safe:animate-zue-breathe md:size-32"
          draggable={false}
        />
      </div>
    </div>
  );
};

export default HibernateOverlay;
