'use client';

import MediaGallery from '@/src/components/MediaGallery/MediaGallery';
import { MediaItem, FilterConfig } from '@/src/components/MediaGallery/types';
import { ContentEntry } from '@/src/lib/content';

export default function BookGallery({ books }: { books: ContentEntry[] }) {
  const mediaItems: MediaItem[] = books.map((book) => ({
    title: book.title,
    subtitle: book.author ?? '',
    cover: book.cover ?? '',
    description: book.description,
    year: book.year,
    categories: book.genres ?? [],
    type: 'book',
    // Some books carry a `link` in their frontmatter; it was previously parsed
    // and then dropped on the floor.
    externalLink: book.link
      ? {
          url: book.link,
          label: 'View Book',
          icon: '/icons/book.svg',
        }
      : undefined,
  }));

  const filterConfig: FilterConfig = {
    categoryLabel: 'allGenres',
    subtitleLabel: 'allAuthors',
    yearLabel: 'allYears',
    resetLabel: 'reset',
    itemSingular: 'book',
    itemPlural: 'books',
    aspectRatio: 'auto',
  };

  return (
    <MediaGallery items={mediaItems} filterConfig={filterConfig} translationNamespace="Books" />
  );
}
