import { describe, expect, it } from 'vitest';
import { canUseCustomCursor, canUseLenis, prefersReducedMotion } from './motion';

describe('motion helpers', () => {
  it('exposes preference helpers without throwing in jsdom', () => {
    expect(typeof prefersReducedMotion()).toBe('boolean');
    expect(typeof canUseLenis()).toBe('boolean');
    expect(typeof canUseCustomCursor()).toBe('boolean');
  });
});
