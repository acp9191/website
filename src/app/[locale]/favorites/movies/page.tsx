// app/favorites/movies/page.tsx
import { setRequestLocale } from 'next-intl/server';
import { loadContent } from '@/src/lib/content';
import MovieGallery from './MovieGallery';

export default async function MoviePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const movies = await loadContent('movies');

  return <MovieGallery movies={movies} />;
}
