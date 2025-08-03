// app/favorites/music/MusicGallery.tsx
'use client';

import { useState } from 'react';

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
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedYear, setSelectedYear] = useState<number | 'All'>('All');

  const allGenres = Array.from(new Set(albums.flatMap((a) => a.genres))).sort();
  const allYears = Array.from(new Set(albums.map((a) => a.year))).sort((a, b) => b - a);

  const filtered = albums.filter((album) => {
    const genreMatch = selectedGenre === 'All' || album.genres.includes(selectedGenre);
    const yearMatch = selectedYear === 'All' || album.year === selectedYear;
    return genreMatch && yearMatch;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">🎧 Favorite Albums</h1>

      <div className="flex flex-wrap gap-4 mb-8">
        <select
          value={selectedGenre}
          onChange={(e) => setSelectedGenre(e.target.value)}
          className="px-3 py-2 rounded-md border dark:bg-gray-800 dark:text-white"
        >
          <option value="All">All Genres</option>
          {allGenres.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>

        <select
          value={selectedYear}
          onChange={(e) => {
            const val = e.target.value;
            setSelectedYear(val === 'All' ? 'All' : parseInt(val));
          }}
          className="px-3 py-2 rounded-md border dark:bg-gray-800 dark:text-white"
        >
          <option value="All">All Years</option>
          {allYears.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
        {filtered.map((album, i) => (
          <div
            key={i}
            className="rounded-lg bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow overflow-hidden"
          >
            <div className="p-4">
              <div className="w-full aspect-square overflow-hidden rounded-md">
                <img src={album.cover} alt={album.title} className="w-full h-full object-cover" />
              </div>
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-1">{album.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{album.artist}</p>
              <div className="mt-2 flex flex-wrap gap-1 text-xs text-gray-500 dark:text-gray-400">
                {album.genres.map((g) => (
                  <span key={g} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full">
                    {g}
                  </span>
                ))}
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 line-clamp-3">
                {album.description}
              </p>
              {album.spotify && (
                <div className="mt-3">
                  <a
                    href={album.spotify}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-green-600 hover:underline text-sm"
                  >
                    Listen on Spotify
                  </a>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
