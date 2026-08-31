import { describe, expect, it } from 'vitest';
import { compareSemver } from './app-update';

describe('compareSemver', () => {
  it('trata versões iguais (com ou sem prefixo v)', () => {
    expect(compareSemver('1.2.3', '1.2.3')).toBe(0);
    expect(compareSemver('v1.2.3', '1.2.3')).toBe(0);
    expect(compareSemver('1.0.0', 'v1.0.0')).toBe(0);
  });

  it('detecta major / minor / patch maiores', () => {
    expect(compareSemver('2.0.0', '1.9.9')).toBeGreaterThan(0);
    expect(compareSemver('1.3.0', '1.2.9')).toBeGreaterThan(0);
    expect(compareSemver('1.2.4', '1.2.3')).toBeGreaterThan(0);
  });

  it('detecta versão remota menor que a instalada', () => {
    expect(compareSemver('1.0.0', '1.0.1')).toBeLessThan(0);
    expect(compareSemver('0.9.9', '1.0.0')).toBeLessThan(0);
  });

  it('ignora sufixos pré-release / build no core semântico', () => {
    expect(compareSemver('1.2.3-beta.1', '1.2.3')).toBe(0);
    expect(compareSemver('1.2.3+build.5', '1.2.3')).toBe(0);
  });

  it('preenche segmentos ausentes com zero', () => {
    expect(compareSemver('1.2', '1.2.0')).toBe(0);
    expect(compareSemver('1', '1.0.0')).toBe(0);
    expect(compareSemver('1.2.1', '1.2')).toBeGreaterThan(0);
  });
});
