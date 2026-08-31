import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { canUseCustomCursor } from '@/lib/motion';
import { cn } from '@/lib/utils';

const INTERACTIVE =
  'a, button, [role="button"], input, textarea, select, label, [data-cursor="interactive"]';

/**
 * Cursor fino (ponto + anel) — web com pointer fine.
 * Desligado em touch, app nativo e prefers-reduced-motion.
 */
const CustomCursor = () => {
  const [active, setActive] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [hovering, setHovering] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!canUseCustomCursor()) return;

    setActive(true);
    document.documentElement.classList.add('zue-custom-cursor');

    const onMove = (e: PointerEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
      setVisible(true);
      const target = e.target as Element | null;
      setHovering(Boolean(target?.closest?.(INTERACTIVE)));
    };

    const onLeave = () => setVisible(false);
    const onEnter = () => setVisible(true);

    window.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('mouseleave', onLeave);
    document.documentElement.addEventListener('mouseenter', onEnter);

    return () => {
      document.documentElement.classList.remove('zue-custom-cursor');
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('mouseleave', onLeave);
      document.documentElement.removeEventListener('mouseenter', onEnter);
    };
  }, []);

  if (!active || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className={cn(
        'pointer-events-none fixed top-0 left-0 z-[200] mix-blend-difference transition-opacity duration-200',
        visible ? 'opacity-100' : 'opacity-0'
      )}
      style={{
        transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`,
      }}
      aria-hidden
    >
      <div
        className={cn(
          'absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-white transition-transform duration-200 ease-out',
          hovering ? 'size-1.5 scale-0' : 'size-1.5 scale-100'
        )}
      />
      <div
        className={cn(
          'absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-white transition-[width,height,opacity] duration-300 ease-out',
          hovering ? 'size-10 opacity-90' : 'size-7 opacity-70'
        )}
      />
    </div>,
    document.body
  );
};

export default CustomCursor;
