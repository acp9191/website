'use client';

import MediaGallery from '@/src/components/MediaGallery/MediaGallery';
import { MediaItem, FilterConfig } from '@/src/components/MediaGallery/types';

type Movie = {
  title: string;
  director: string;
  poster: string;
  description: string;
  year: number;
  genres: string[];
  trailer?: string;
};

export default function MovieGallery({ movies }: { movies: Movie[] }) {
  const mediaItems: MediaItem[] = movies.map((movie) => ({
    title: movie.title,
    subtitle: movie.director,
    cover: movie.poster,
    description: movie.description,
    year: movie.year,
    categories: movie.genres,
    type: 'movie', // Specify type as movie
    externalLink: movie.trailer
      ? {
          url: movie.trailer,
          label: 'Watch Trailer',
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
    aspectRatio: 'auto', // Movie posters are typically 3:4 ratio
  };

  return (
    <MediaGallery items={mediaItems} filterConfig={filterConfig} translationNamespace="Movies" />
  );
}
