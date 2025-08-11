'use client';

import MediaGallery from '@/src/components/MediaGallery/MediaGallery';
import { MediaItem, FilterConfig } from '@/src/components/MediaGallery/types';

type Book = {
  title: string;
  author: string;
  cover: string;
  description: string;
  year: number;
  genres: string[];
};

export default function BookGallery({ books }: { books: Book[] }) {
  const mediaItems: MediaItem[] = books.map((movie) => ({
    title: movie.title,
    subtitle: movie.author,
    cover: movie.cover,
    description: movie.description,
    year: movie.year,
    categories: movie.genres,
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
