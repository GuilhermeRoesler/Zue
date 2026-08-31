import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { prefersReducedMotion } from '@/lib/motion';
import { cn } from '@/lib/utils';

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Delay em ms após entrar na viewport. */
  delay?: number;
  /** Variante visual. */
  variant?: 'fade-up' | 'fade' | 'blur-up';
  as?: 'div' | 'section' | 'article' | 'li' | 'span';
}

/**
 * Fade/stagger ao entrar na viewport. Respeita prefers-reduced-motion.
 */
const Reveal = ({
  children,
  className,
  delay = 0,
  variant = 'fade-up',
  as: Tag = 'div',
}: RevealProps) => {
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion()) {
      setShown(true);
      return;
    }

    const node = ref.current;
    if (!node) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
    );

    io.observe(node);
    return () => io.disconnect();
  }, []);

  const style: CSSProperties | undefined = prefersReducedMotion()
    ? undefined
    : { transitionDelay: shown ? `${delay}ms` : '0ms' };

  return (
    <Tag
      ref={ref as never}
      style={style}
      className={cn(
        'motion-safe:transition-[opacity,transform,filter] motion-safe:duration-700 motion-safe:ease-out',
        !shown &&
          variant === 'fade-up' &&
          'motion-safe:translate-y-6 motion-safe:opacity-0',
        !shown && variant === 'fade' && 'motion-safe:opacity-0',
        !shown &&
          variant === 'blur-up' &&
          'motion-safe:translate-y-4 motion-safe:opacity-0 motion-safe:blur-sm',
        shown && 'motion-safe:translate-y-0 motion-safe:opacity-100 motion-safe:blur-0',
        className
      )}
    >
      {children}
    </Tag>
  );
};

export default Reveal;
