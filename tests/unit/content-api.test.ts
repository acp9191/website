import { describe, expect, it } from 'vitest';
import { publicCollection, publicContent } from '@/src/lib/contentApi';
import { MEDIA_SECTIONS } from '@/src/lib/media';
import { SITE_URL } from '@/src/lib/metadata';

describe('machine-readable content', () => {
  it('publishes a versioned index containing every collection', async () => {
    const content = await publicContent();

    expect(content.schemaVersion).toBe(1);
    expect(Object.keys(content.collections).sort()).toEqual([...MEDIA_SECTIONS].sort());
    expect(content.items).toHaveLength(content.itemCount);
  });

  it.each(MEDIA_SECTIONS)('normalizes %s entries with canonical IDs and URLs', async (section) => {
    const collection = await publicCollection(section);

    expect(collection.schemaVersion).toBe(1);
    expect(collection.items).toHaveLength(collection.itemCount);
    for (const item of collection.items) {
      expect(item.id).toBeTruthy();
      expect(item.collection).toBe(section);
      expect(item.language).toBe('en');
      expect(item.creator).toBeTruthy();
      expect(item.image).toMatch(/^https:\/\//);
      expect(item.url).toBe(`${SITE_URL}/favorites/${section}/${item.id}`);
    }
  });
});
