interface HibernateOverlayProps {
  visible: boolean;
}

const HibernateOverlay = ({ visible }: HibernateOverlayProps) => {
  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-white"
      aria-hidden={!visible}
      role="presentation"
    >
      <img
        src="/favicon.svg"
        alt=""
        className="size-24 motion-safe:animate-pulse md:size-32"
        draggable={false}
      />
    </div>
  );
};

export default HibernateOverlay;
