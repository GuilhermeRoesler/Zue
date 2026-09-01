import { describe, expect, it } from 'vitest';
import { countPlanFiles, type DriveCollectionPlan } from './google-drive-api';
import { _needsDownloadForTest } from './google-drive-cache';

describe('countPlanFiles', () => {
  it('sums files across collection plans', () => {
    const plans: DriveCollectionPlan[] = [
      {
        id: 'vitrine',
        title: 'Root',
        relativeDir: '',
        files: [
          { id: '1', name: 'a.jpg', mimeType: 'image/jpeg' },
          { id: '2', name: 'b.mp4', mimeType: 'video/mp4' },
        ],
      },
      {
        id: 'folder-x',
        title: 'X',
        relativeDir: 'X',
        files: [{ id: '3', name: 'c.png', mimeType: 'image/png' }],
      },
    ];
    expect(countPlanFiles(plans)).toBe(3);
  });
});

describe('needsDownload', () => {
  it('downloads when missing from cache', () => {
    expect(
      _needsDownloadForTest(
        { id: '1', name: 'a.jpg', mimeType: 'image/jpeg', md5Checksum: 'abc' },
        undefined
      )
    ).toBe(true);
  });

  it('skips when md5 matches', () => {
    expect(
      _needsDownloadForTest(
        {
          id: '1',
          name: 'a.jpg',
          mimeType: 'image/jpeg',
          md5Checksum: 'abc',
          modifiedTime: '2024-01-01',
        },
        {
          id: '1',
          name: 'a.jpg',
          relativePath: 'a.jpg',
          storageKey: 'x/a.jpg',
          md5Checksum: 'abc',
          modifiedTime: '2024-01-01',
        }
      )
    ).toBe(false);
  });

  it('redownloads when md5 changes', () => {
    expect(
      _needsDownloadForTest(
        {
          id: '1',
          name: 'a.jpg',
          mimeType: 'image/jpeg',
          md5Checksum: 'new',
        },
        {
          id: '1',
          name: 'a.jpg',
          relativePath: 'a.jpg',
          storageKey: 'x/a.jpg',
          md5Checksum: 'old',
        }
      )
    ).toBe(true);
  });
});
