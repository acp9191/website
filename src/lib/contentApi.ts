import { loadContent } from '@/src/lib/content';
import {
  MEDIA_CONFIG,
  MEDIA_SECTIONS,
  toPublicMediaItem,
  type MediaSection,
} from '@/src/lib/media';
import { SITE_NAME, SITE_URL } from '@/src/lib/metadata';

export async function publicCollection(section: MediaSection) {
  const entries = await loadContent(MEDIA_CONFIG[section].contentCollection);

  return {
    schemaVersion: 1,
    site: SITE_NAME,
    collection: section,
    language: 'en' as const,
    url: `${SITE_URL}/api/v1/content/${section}`,
    itemCount: entries.length,
    items: entries.map((entry) => toPublicMediaItem(section, entry)),
  };
}

export async function publicContent() {
  const collections = await Promise.all(MEDIA_SECTIONS.map(publicCollection));

  return {
    schemaVersion: 1,
    site: SITE_NAME,
    url: `${SITE_URL}/api/v1/content`,
    language: 'en' as const,
    collections: Object.fromEntries(
      collections.map((collection) => [
        collection.collection,
        {
          url: collection.url,
          itemCount: collection.itemCount,
        },
      ])
    ),
    itemCount: collections.reduce((total, collection) => total + collection.itemCount, 0),
    items: collections.flatMap((collection) => collection.items),
  };
}
