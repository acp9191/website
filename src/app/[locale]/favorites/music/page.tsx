// app/favorites/music/page.tsx
import { setRequestLocale } from 'next-intl/server';
import { loadContent } from '@/src/lib/content';
import MusicGallery from './MusicGallery';

export default async function MusicPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const albums = await loadContent('albums');

  return <MusicGallery albums={albums} />;
}
