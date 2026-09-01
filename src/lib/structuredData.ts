import type { ContentEntry } from '@/src/lib/content';
import { routing } from '@/src/i18n/routing';
import {
  creatorFor,
  externalUrlFor,
  imageFor,
  MEDIA_CONFIG,
  mediaItemUrl,
  type MediaSection,
} from '@/src/lib/media';
import { HEADSHOT_URL } from '@/src/utils/imageOptimization';
import { SITE_NAME, SITE_URL } from '@/src/lib/metadata';

export type JsonLdValue = Record<string, unknown>;

export const PERSON_ID = `${SITE_URL}/#person`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

export function siteJsonLd(): JsonLdValue {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': PERSON_ID,
        name: SITE_NAME,
        url: SITE_URL,
        image: HEADSHOT_URL,
        sameAs: [
          'https://github.com/acp9191',
          'https://linkedin.com/in/acp',
          'https://www.instagram.com/acp.jpg',
          'https://x.com/acp9191',
        ],
      },
      {
        '@type': 'WebSite',
        '@id': WEBSITE_ID,
        name: SITE_NAME,
        url: SITE_URL,
        inLanguage: routing.locales,
        publisher: { '@id': PERSON_ID },
      },
    ],
  };
}

function mediaEntity(section: MediaSection, entry: ContentEntry, locale: string): JsonLdValue {
  const config = MEDIA_CONFIG[section];
  const creator = { '@type': 'Person', name: creatorFor(section, entry) };
  const externalUrl = externalUrlFor(section, entry);
  const creatorProperty =
    section === 'music'
      ? { byArtist: creator }
      : section === 'books'
        ? { author: creator }
        : { director: creator };

  return {
    '@type': config.type,
    '@id': `${mediaItemUrl(section, entry.slug, locale)}#item`,
    url: mediaItemUrl(section, entry.slug, locale),
    name: entry.title,
    description: entry.description,
    inLanguage: 'en',
    image: imageFor(section, entry),
    datePublished: String(entry.year),
    genre: entry.genres ?? [],
    ...creatorProperty,
    ...(section === 'music' && externalUrl ? { sameAs: externalUrl } : {}),
  };
}

export function mediaJsonLd(
  section: MediaSection,
  entry: ContentEntry,
  locale: string
): JsonLdValue {
  return {
    '@context': 'https://schema.org',
    ...mediaEntity(section, entry, locale),
  };
}

export function collectionJsonLd({
  section,
  entries,
  locale,
  name,
  description,
}: {
  section: MediaSection;
  entries: ContentEntry[];
  locale: string;
  name: string;
  description: string;
}): JsonLdValue {
  const url = `${SITE_URL}${locale === routing.defaultLocale ? '' : `/${locale}`}${MEDIA_CONFIG[section].path}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${url}#collection`,
    url,
    name,
    description,
    inLanguage: locale,
    isPartOf: { '@id': WEBSITE_ID },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: entries.length,
      itemListElement: entries.map((entry, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: mediaEntity(section, entry, locale),
      })),
    },
  };
}
