'use client';

import MediaGallery, { MediaItem, FilterConfig } from '@/src/components/MediaGallery';

type Album = {
  title: string;
  artist: string;
  cover: string;
  description: string;
  year: number;
  genres: string[];
  spotify?: string;
};

export default function MusicGallery({ albums }: { albums: Album[] }) {
  // Convert albums to MediaItem format
  const mediaItems: MediaItem[] = albums.map((album) => ({
    title: album.title,
    subtitle: album.artist, // Artist becomes subtitle
    cover: album.cover,
    description: album.description,
    year: album.year,
    categories: album.genres, // Genres become categories
    type: 'music', // Specify type as music
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
