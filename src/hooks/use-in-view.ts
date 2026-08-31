import { useEffect, useState, type RefObject } from 'react';

interface UseInViewOptions {
  rootMargin?: string;
  threshold?: number;
  /** Se true, permanece true após a primeira interseção. */
  once?: boolean;
}

/** Observa se o elemento está (quase) visível no viewport. */
export function useInView(
  ref: RefObject<Element | null>,
  {
    rootMargin = '120px 0px',
    threshold = 0.2,
    once = false,
  }: UseInViewOptions = {}
): boolean {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (entry.isIntersecting) {
          setInView(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { rootMargin, threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, rootMargin, threshold, once]);

  return inView;
}
