// app/favorites/music/page.tsx
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { loadContent } from '@/src/lib/content';
import MusicGallery from './MusicGallery';
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
  return buildMetadata({ locale, path: '/favorites/music', titleKey: 'music' });
}

export default async function MusicPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const query = await searchParams;
  const initialParams = parseFilterParams(query, 'artist');

  const albums = await loadContent('albums');
  const t = await getTranslations({ locale, namespace: 'Music' });

  return (
    <>
      <JsonLd
        data={collectionJsonLd({
          section: 'music',
          entries: albums,
          locale,
          name: t('title'),
          description: t('subtitle'),
        })}
      />
      <MusicGallery albums={albums} initialParams={initialParams} />
    </>
  );
}
