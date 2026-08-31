import { describe, expect, it } from 'vitest';
import { cn } from './utils';

describe('cn', () => {
  it('mescla classes e remove conflitos do Tailwind', () => {
    expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4');
  });

  it('ignora valores falsy', () => {
    const maybeHidden = false as boolean;
    expect(cn('text-black', maybeHidden && 'hidden', undefined, null, 'font-light')).toBe(
      'text-black font-light'
    );
  });
});
