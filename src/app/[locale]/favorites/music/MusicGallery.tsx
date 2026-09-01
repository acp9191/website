'use client';

import { useTranslations } from 'next-intl';
import MediaGallery from '@/src/components/MediaGallery/MediaGallery';
import { MediaItem, FilterConfig } from '@/src/components/MediaGallery/types';
import { ContentEntry } from '@/src/lib/content';
import type { MediaFilterParams } from '@/src/lib/galleryFilters';

export default function MusicGallery({
  albums,
  initialParams = {},
}: {
  albums: ContentEntry[];
  initialParams?: MediaFilterParams;
}) {
  const t = useTranslations('Music');

  // Convert albums to MediaItem format
  const mediaItems: MediaItem[] = albums.map((album) => ({
    href: `/favorites/music/${album.slug}`,
    title: album.title,
    subtitle: album.artist ?? '',
    cover: album.cover ?? '',
    coverAlt: t('coverAlt', { title: album.title }),
    description: album.description,
    year: album.year,
    categories: album.genres ?? [],
    type: 'music',
    externalLink: album.spotify
      ? {
          url: album.spotify,
          label: t('listenOnSpotify'),
          icon: '/icons/spotify.svg',
        }
      : undefined,
  }));

  // Configure filters for music
  const filterConfig: FilterConfig = {
    subtitleLabel: 'artist',
    itemSingular: 'album',
    itemPlural: 'albums',
    aspectRatio: 'square', // Album covers are typically square
  };

  return (
    <MediaGallery
      items={mediaItems}
      filterConfig={filterConfig}
      translationNamespace="Music"
      initialParams={initialParams}
    />
  );
}
