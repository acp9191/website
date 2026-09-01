import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import JsonLd from '@/src/components/JsonLd';
import MediaDetail from '@/src/components/MediaDetail';
import { loadContent, loadContentEntry } from '@/src/lib/content';
import { buildMediaMetadata } from '@/src/lib/metadata';
import { imageFor, MEDIA_CONFIG, mediaItemPath, type MediaSection } from '@/src/lib/media';
import { mediaJsonLd } from '@/src/lib/structuredData';

type DetailParams = Promise<{ locale: string; slug: string }>;

export async function mediaStaticParams(section: MediaSection) {
  return (await loadContent(MEDIA_CONFIG[section].contentCollection)).map(({ slug }) => ({ slug }));
}

export async function mediaMetadata(
  section: MediaSection,
  params: DetailParams
): Promise<Metadata> {
  const { locale, slug } = await params;
  const entry = await loadContentEntry(MEDIA_CONFIG[section].contentCollection, slug);
  if (!entry) notFound();
  return buildMediaMetadata({
    locale,
    entry,
    path: mediaItemPath(section, entry.slug),
    image: imageFor(section, entry),
  });
}

export async function MediaDetailPage({
  section,
  params,
}: {
  section: MediaSection;
  params: DetailParams;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const config = MEDIA_CONFIG[section];
  const entry = await loadContentEntry(config.contentCollection, slug);
  if (!entry) notFound();

  const t = await getTranslations({ locale, namespace: config.namespace });
  const tGallery = await getTranslations({ locale, namespace: 'Gallery' });
  const external =
    section === 'music'
      ? t('listenOnSpotify')
      : section === 'movies'
        ? t('watchTrailer')
        : undefined;

  return (
    <>
      <JsonLd data={mediaJsonLd(section, entry, locale)} />
      <MediaDetail
        entry={entry}
        section={section}
        locale={locale}
        labels={{
          collection: t('title'),
          creator: t(config.creatorKey),
          year: tGallery('year'),
          genres: tGallery('genre'),
          external,
        }}
      />
    </>
  );
}
