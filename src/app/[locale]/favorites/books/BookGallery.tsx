'use client';

import { useTranslations } from 'next-intl';
import MediaGallery from '@/src/components/MediaGallery/MediaGallery';
import { MediaItem, FilterConfig } from '@/src/components/MediaGallery/types';
import { ContentEntry } from '@/src/lib/content';

export default function BookGallery({ books }: { books: ContentEntry[] }) {
  const t = useTranslations('Books');

  const mediaItems: MediaItem[] = books.map((book) => ({
    title: book.title,
    subtitle: book.author ?? '',
    cover: book.cover ?? '',
    coverAlt: t('coverAlt', { title: book.title }),
    description: book.description,
    year: book.year,
    categories: book.genres ?? [],
    type: 'book',
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
