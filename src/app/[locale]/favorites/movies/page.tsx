// app/favorites/movies/page.tsx
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { loadContent } from '@/src/lib/content';
import MovieGallery from './MovieGallery';
import type { Metadata } from 'next';
import { buildMetadata } from '@/src/lib/metadata';
import JsonLd from '@/src/components/JsonLd';
import { collectionJsonLd } from '@/src/lib/structuredData';
import { parseFilterParams } from '@/src/lib/galleryFilters';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildMetadata({ locale, path: '/favorites/movies', titleKey: 'movies' });
}

export default async function MoviePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const query = await searchParams;
  const initialParams = parseFilterParams(query, 'director');

  const movies = await loadContent('movies');
  const t = await getTranslations({ locale, namespace: 'Movies' });

  return (
    <>
      <JsonLd
        data={collectionJsonLd({
          section: 'movies',
          entries: movies,
          locale,
          name: t('title'),
          description: t('subtitle'),
        })}
      />
      <MovieGallery movies={movies} initialParams={initialParams} />
    </>
  );
}
