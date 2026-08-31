import { describe, expect, it } from 'vitest';
import {
  collectionsFromMediaGroups,
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
      'Colecao Primavera 01'
    );
  });
});

describe('slidesFromMediaEntries', () => {
  it('filters, sorts by name and maps metadata', () => {
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
    expect(slides[0].title).toBe('01 Hero');
    expect(slides[0].alt).toBe('01 Hero');
    expect(slides[2].type).toBe('video');
    expect(slides[2].src).toBe('file:///v');
  });

  it('sorts by date when requested', () => {
    const slides = slidesFromMediaEntries(
      [
        { name: 'a.jpg', src: 'a', lastModified: 100 },
        { name: 'b.jpg', src: 'b', lastModified: 300 },
        { name: 'c.jpg', src: 'c', lastModified: 200 },
      ],
      'date'
    );
    expect(slides.map((s) => s.src)).toEqual(['b', 'c', 'a']);
  });
});

describe('collectionsFromMediaGroups', () => {
  it('builds collections and skips empty groups', () => {
    const collections = collectionsFromMediaGroups([
      {
        id: 'vitrine',
        title: 'Zue',
        entries: [{ name: 'a.jpg', src: 'a' }],
      },
      { id: 'empty', title: 'Vazia', entries: [] },
      {
        id: 'folder-editorial',
        title: 'Editorial',
        entries: [{ name: 'b.mp4', src: 'b' }],
      },
    ]);

    expect(collections).toHaveLength(2);
    expect(collections[0].title).toBe('Zue');
    expect(collections[1].id).toBe('folder-editorial');
    expect(collections[1].slides[0].type).toBe('video');
  });
});
