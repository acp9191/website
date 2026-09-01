import { describe, expect, it } from 'vitest';
import { loadContent } from '@/src/lib/content';
import { collectionJsonLd, mediaJsonLd, siteJsonLd } from '@/src/lib/structuredData';

describe('structured data', () => {
  it('identifies the person and website with stable graph IDs', () => {
    const graph = siteJsonLd()['@graph'];
    expect(graph).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ '@type': 'Person', '@id': expect.stringMatching(/#person$/) }),
        expect.objectContaining({ '@type': 'WebSite', '@id': expect.stringMatching(/#website$/) }),
      ])
    );
  });

  it('uses media-specific Schema.org types and creator properties', async () => {
    const album = (await loadContent('albums'))[0];
    const book = (await loadContent('books'))[0];
    const movie = (await loadContent('movies'))[0];

    expect(mediaJsonLd('music', album, 'en')).toMatchObject({
      '@type': 'MusicAlbum',
      byArtist: { '@type': 'Person' },
    });
    expect(mediaJsonLd('books', book, 'en')).toMatchObject({
      '@type': 'Book',
      author: { '@type': 'Person' },
    });
    expect(mediaJsonLd('movies', movie, 'en')).toMatchObject({
      '@type': 'Movie',
      director: { '@type': 'Person' },
    });
    expect(mediaJsonLd('movies', movie, 'en')).not.toHaveProperty('sameAs');
  });

  it('lists every collection item in order', async () => {
    const entries = await loadContent('albums');
    const data = collectionJsonLd({
      section: 'music',
      entries,
      locale: 'en',
      name: 'Favorite Albums',
      description: 'A personal canon of lasting favorites',
    });
    const list = data.mainEntity as { numberOfItems: number; itemListElement: unknown[] };

    expect(list.numberOfItems).toBe(entries.length);
    expect(list.itemListElement).toHaveLength(entries.length);
  });
});
