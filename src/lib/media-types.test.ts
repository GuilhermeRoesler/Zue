import { describe, expect, it } from 'vitest';
import {
  getExtension,
  getSlideType,
  isMediaFilename,
  slidesFromMediaEntries,
  titleFromFilename,
} from './media-types';

describe('getExtension', () => {
  it('returns lowercase extension', () => {
    expect(getExtension('Foto.JPG')).toBe('jpg');
  });

  it('returns empty when missing', () => {
    expect(getExtension('semext')).toBe('');
  });
});

describe('getSlideType / isMediaFilename', () => {
  it('detects images and videos', () => {
    expect(getSlideType('a.png')).toBe('image');
    expect(getSlideType('b.MP4')).toBe('video');
    expect(getSlideType('c.txt')).toBeNull();
    expect(isMediaFilename('look.webp')).toBe(true);
    expect(isMediaFilename('readme.md')).toBe(false);
  });
});

describe('titleFromFilename', () => {
  it('humanizes underscore names', () => {
    expect(titleFromFilename('colecao_primavera_01.jpg')).toBe(
      'colecao primavera 01'
    );
  });
});

describe('slidesFromMediaEntries', () => {
  it('filters, sorts and maps entries', () => {
    const slides = slidesFromMediaEntries([
      { name: '10-video.mp4', src: 'file:///v' },
      { name: '02-look.jpg', src: 'file:///a' },
      { name: 'notes.txt', src: 'file:///x' },
      { name: '01-hero.png', src: 'file:///b' },
    ]);

    expect(slides.map((s) => s.id)).toEqual([
      'media-01-hero.png',
      'media-02-look.jpg',
      'media-10-video.mp4',
    ]);
    expect(slides[0].type).toBe('image');
    expect(slides[2].type).toBe('video');
    expect(slides[2].src).toBe('file:///v');
  });
});
