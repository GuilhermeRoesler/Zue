import { useEffect, useState } from 'react';
import { prefersReducedMotion } from '@/lib/motion';
import { cn } from '@/lib/utils';

interface TextRevealProps {
  text: string;
  className?: string;
  /** Delay base em ms; cada palavra +60ms. */
  delay?: number;
  as?: 'h1' | 'h2' | 'p' | 'span';
}

/**
 * Revela palavras em sequência (landing). Sem split em reduced-motion.
 */
const TextReveal = ({
  text,
  className,
  delay = 0,
  as: Tag = 'span',
}: TextRevealProps) => {
  const [ready, setReady] = useState(false);
  const reduce = prefersReducedMotion();
  const words = text.split(' ');

  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  if (reduce) {
    return <Tag className={className}>{text}</Tag>;
  }

  return (
    <Tag className={cn('inline-block', className)} aria-label={text}>
      {words.map((word, i) => (
        <span key={`${word}-${i}`} className="inline-block overflow-hidden align-bottom">
          <span
            className={cn(
              'inline-block transition-[transform,opacity] duration-700 ease-out',
              ready
                ? 'translate-y-0 opacity-100'
                : 'translate-y-[110%] opacity-0'
            )}
            style={{ transitionDelay: `${delay + i * 70}ms` }}
            aria-hidden
          >
            {word}
            {i < words.length - 1 ? '\u00A0' : ''}
          </span>
        </span>
      ))}
    </Tag>
  );
};

export default TextReveal;
