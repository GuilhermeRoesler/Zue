import { Capacitor } from '@capacitor/core';

/** True when the user prefers reduced motion. */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return true;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Fine pointer + hover (desktop mouse/trackpad).
 * False on touch tablets even when they report some pointer events.
 */
export function canUseCustomCursor(): boolean {
  if (typeof window === 'undefined') return false;
  if (Capacitor.isNativePlatform()) return false;
  if (prefersReducedMotion()) return false;

  const fine = window.matchMedia('(pointer: fine)').matches;
  const hover = window.matchMedia('(hover: hover)').matches;
  return fine && hover;
}

/** Lenis only on web, never on Capacitor native / reduced motion. */
export function canUseLenis(): boolean {
  if (typeof window === 'undefined') return false;
  if (Capacitor.isNativePlatform()) return false;
  if (prefersReducedMotion()) return false;
  return true;
}
