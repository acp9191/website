'use client';

import { useTranslations } from 'next-intl';
import MediaGallery from '@/src/components/MediaGallery/MediaGallery';
import { MediaItem, FilterConfig } from '@/src/components/MediaGallery/types';
import { ContentEntry } from '@/src/lib/content';

export default function MovieGallery({ movies }: { movies: ContentEntry[] }) {
  const t = useTranslations('Movies');

  const mediaItems: MediaItem[] = movies.map((movie) => ({
    title: movie.title,
    subtitle: movie.director ?? '',
    // Movies name their image `poster`; albums and books use `cover`.
    cover: movie.poster ?? '',
    coverAlt: t('coverAlt', { title: movie.title }),
    description: movie.description,
    year: movie.year,
    categories: movie.genres ?? [],
    type: 'movie',
    externalLink: movie.trailer
      ? {
          url: movie.trailer,
          label: t('watchTrailer'),
          icon: '/icons/youtube.svg',
        }
      : undefined,
  }));

  const filterConfig: FilterConfig = {
    categoryLabel: 'allGenres',
    subtitleLabel: 'allDirectors',
    yearLabel: 'allYears',
    resetLabel: 'reset',
    itemSingular: 'movie',
    itemPlural: 'movies',
    aspectRatio: 'auto',
  };

  return (
    <MediaGallery items={mediaItems} filterConfig={filterConfig} translationNamespace="Movies" />
  );
}
