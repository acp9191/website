// app/favorites/movies/page.tsx
import { setRequestLocale } from 'next-intl/server';
import { loadContent } from '@/src/lib/content';
import MovieGallery from './MovieGallery';
import type { Metadata } from 'next';
import { buildMetadata } from '@/src/lib/metadata';


export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildMetadata({ locale, path: '/favorites/movies', titleKey: 'movies' });
}

export default async function MoviePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const movies = await loadContent('movies');

  return <MovieGallery movies={movies} />;
}
