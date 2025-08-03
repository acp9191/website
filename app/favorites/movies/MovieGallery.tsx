'use client';

import { useState } from 'react';
import clsx from 'clsx';
import Image from 'next/image';

type Movie = {
  title: string;
  director: string;
  poster: string;
  description: string;
  year: number;
  genres: string[];
  trailer?: string;
};

export default function MovieGallery({ movies }: { movies: Movie[] }) {
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedYear, setSelectedYear] = useState<number | 'All'>('All');
  const [modalImage, setModalImage] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const allGenres = Array.from(new Set(movies.flatMap((m) => m.genres))).sort();
  const allYears = Array.from(new Set(movies.map((m) => m.year))).sort((a, b) => b - a);

  const filtered = movies.filter((movie) => {
    const genreMatch = selectedGenre === 'All' || movie.genres.includes(selectedGenre);
    const yearMatch = selectedYear === 'All' || movie.year === selectedYear;
    return genreMatch && yearMatch;
  });

  const openModal = (poster: string) => {
    setModalImage(poster);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setTimeout(() => setModalImage(null), 300);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">🎬 Favorite Movies</h1>

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
        {filtered.map((movie, i) => (
          <div
            key={i}
            className="rounded-lg bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow overflow-hidden"
          >
            <div className="p-4">
              <div
                className="relative w-full aspect-[2/3] overflow-hidden rounded-md cursor-pointer"
                onClick={() => openModal(movie.poster)}
              >
                <Image
                  src={movie.poster}
                  alt={movie.title}
                  fill
                  className="object-cover rounded-md transition-opacity duration-300 hover:opacity-90"
                />
              </div>
            </div>

            <div className="p-4">
              <h3 className="text-lg font-semibold mb-1">{movie.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{movie.director}</p>
              <div className="mt-2 flex flex-wrap gap-1 text-xs">
                {movie.genres.map((g) => (
                  <span
                    key={g}
                    className="px-2 py-0.5 rounded-full bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-white"
                  >
                    {g}
                  </span>
                ))}
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 line-clamp-4">
                {movie.description}
              </p>
              {movie.trailer && (
                <div className="mt-3">
                  <a
                    href={movie.trailer}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-[#FF0000] hover:underline text-sm font-medium"
                  >
                    <Image
                      src="/icons/youtube.svg"
                      alt="YouTube icon"
                      width={20}
                      height={20}
                      className="inline-block"
                    />
                    Watch Trailer
                  </a>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {modalImage && (
        <div
          onClick={closeModal}
          className={clsx(
            'fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/40 transition-opacity duration-300',
            {
              'opacity-100': showModal,
              'opacity-0 pointer-events-none': !showModal,
            }
          )}
        >
          <div className="relative w-[100vw] max-w-2xl aspect-square">
            <Image
              src={modalImage}
              alt="Movie poster full size"
              fill
              className="rounded-lg object-contain shadow-xl transition-transform duration-300"
            />
          </div>
        </div>
      )}
    </div>
  );
}
