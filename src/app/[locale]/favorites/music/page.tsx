// app/favorites/music/page.tsx
import { setRequestLocale } from 'next-intl/server';
import { loadContent } from '@/src/lib/content';
import MusicGallery from './MusicGallery';
import type { Metadata } from 'next';
import { buildMetadata } from '@/src/lib/metadata';


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

  return <MusicGallery albums={albums} />;
}
