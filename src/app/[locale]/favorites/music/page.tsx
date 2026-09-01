// app/favorites/music/page.tsx
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { loadContent } from '@/src/lib/content';
import MusicGallery from './MusicGallery';
import type { Metadata } from 'next';
import { buildMetadata } from '@/src/lib/metadata';
import JsonLd from '@/src/components/JsonLd';
import { collectionJsonLd } from '@/src/lib/structuredData';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildMetadata({ locale, path: '/favorites/music', titleKey: 'music' });
}

export default async function MusicPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

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
      <MusicGallery albums={albums} />
    </>
  );
}
