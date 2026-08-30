'use client';

import MediaGallery from '@/src/components/MediaGallery/MediaGallery';
import { MediaItem, FilterConfig } from '@/src/components/MediaGallery/types';
import { ContentEntry } from '@/src/lib/content';

export default function MusicGallery({ albums }: { albums: ContentEntry[] }) {
  // Convert albums to MediaItem format
  const mediaItems: MediaItem[] = albums.map((album) => ({
    title: album.title,
    subtitle: album.artist ?? '',
    cover: album.cover ?? '',
    description: album.description,
    year: album.year,
    categories: album.genres ?? [],
    type: 'music',
    externalLink: album.spotify
      ? {
          url: album.spotify,
          label: 'Listen on Spotify',
          icon: '/icons/spotify.svg',
        }
      : undefined,
  }));

  // Configure filters for music
  const filterConfig: FilterConfig = {
    categoryLabel: 'allGenres',
    subtitleLabel: 'allArtists',
    yearLabel: 'allYears',
    resetLabel: 'reset',
    itemSingular: 'album',
    itemPlural: 'albums',
    aspectRatio: 'square', // Album covers are typically square
  };

  return (
    <MediaGallery items={mediaItems} filterConfig={filterConfig} translationNamespace="Music" />
  );
}
