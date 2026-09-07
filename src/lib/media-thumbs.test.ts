import { describe, expect, it } from 'vitest';
import { fitWithinMaxEdge, THUMB_MAX_EDGE } from './media-thumbs';

describe('fitWithinMaxEdge', () => {
  it('keeps small images unchanged', () => {
    expect(fitWithinMaxEdge(400, 600)).toEqual({ width: 400, height: 600 });
  });

  it('scales down by longest edge', () => {
    expect(fitWithinMaxEdge(4000, 3000, 960)).toEqual({
      width: 960,
      height: 720,
    });
  });

  it('uses THUMB_MAX_EDGE by default', () => {
    const result = fitWithinMaxEdge(1920, 1080);
    expect(Math.max(result.width, result.height)).toBe(THUMB_MAX_EDGE);
  });
});
