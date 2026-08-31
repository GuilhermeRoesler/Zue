import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import { canUseLenis } from '@/lib/motion';

/**
 * Smooth scroll Lenis — somente web (não nativo / não reduced-motion).
 * Desativa quando `enabled` é false (ex.: catálogo fullscreen).
 */
export function useLenis(enabled = true): void {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (!enabled || !canUseLenis()) {
      lenisRef.current?.destroy();
      lenisRef.current = null;
      return;
    }

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    lenisRef.current = lenis;

    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [enabled]);
}
