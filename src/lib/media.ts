import type { ContentCollection, ContentEntry } from '@/src/lib/content';
import { localePath, SITE_URL } from '@/src/lib/metadata';

export const MEDIA_SECTIONS = ['music', 'books', 'movies'] as const;
export type MediaSection = (typeof MEDIA_SECTIONS)[number];

type MediaConfig = {
  contentCollection: ContentCollection;
  path: `/favorites/${MediaSection}`;
  type: 'MusicAlbum' | 'Book' | 'Movie';
  creatorKey: 'artist' | 'author' | 'director';
  imageKey: 'cover' | 'poster';
  externalKey?: 'spotify' | 'trailer';
  namespace: 'Music' | 'Books' | 'Movies';
};

export const MEDIA_CONFIG: Record<MediaSection, MediaConfig> = {
  music: {
    contentCollection: 'albums',
    path: '/favorites/music',
    type: 'MusicAlbum',
    creatorKey: 'artist',
    imageKey: 'cover',
    externalKey: 'spotify',
    namespace: 'Music',
  },
  books: {
    contentCollection: 'books',
    path: '/favorites/books',
    type: 'Book',
    creatorKey: 'author',
    imageKey: 'cover',
    namespace: 'Books',
  },
  movies: {
    contentCollection: 'movies',
    path: '/favorites/movies',
    type: 'Movie',
    creatorKey: 'director',
    imageKey: 'poster',
    externalKey: 'trailer',
    namespace: 'Movies',
  },
};

export function mediaItemPath(section: MediaSection, slug: string): string {
  return `${MEDIA_CONFIG[section].path}/${slug}`;
}

export function mediaItemUrl(section: MediaSection, slug: string, locale = 'en'): string {
  return `${SITE_URL}${localePath(locale, mediaItemPath(section, slug))}`;
}

export function creatorFor(section: MediaSection, entry: ContentEntry): string {
  return entry[MEDIA_CONFIG[section].creatorKey] ?? '';
}

export function imageFor(section: MediaSection, entry: ContentEntry): string {
  return entry[MEDIA_CONFIG[section].imageKey] ?? '';
}

export function externalUrlFor(section: MediaSection, entry: ContentEntry): string | undefined {
  const key = MEDIA_CONFIG[section].externalKey;
  return key ? entry[key] : undefined;
}

export type PublicMediaItem = {
  id: string;
  type: MediaConfig['type'];
  collection: MediaSection;
  title: string;
  creator: string;
  year: number;
  genres: string[];
  description: string;
  language: 'en';
  url: string;
  image: string;
  externalUrl?: string;
};

export function toPublicMediaItem(section: MediaSection, entry: ContentEntry): PublicMediaItem {
  const externalUrl = externalUrlFor(section, entry);

  return {
    id: entry.slug,
    type: MEDIA_CONFIG[section].type,
    collection: section,
    title: entry.title,
    creator: creatorFor(section, entry),
    year: entry.year,
    genres: entry.genres ?? [],
    description: entry.description,
    language: 'en',
    url: mediaItemUrl(section, entry.slug),
    image: imageFor(section, entry),
    ...(externalUrl ? { externalUrl } : {}),
  };
}
