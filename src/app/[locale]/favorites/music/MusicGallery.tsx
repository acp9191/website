'use client';

import { useState, useEffect, useRef } from 'react';
import clsx from 'clsx';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

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
  const t = useTranslations('Music');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedArtist, setSelectedArtist] = useState('All');
  const [selectedYear, setSelectedYear] = useState<number | 'All'>('All');
  const [modalImage, setModalImage] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [visibleItems, setVisibleItems] = useState<Set<string>>(new Set());
  const [genreDropdownOpen, setGenreDropdownOpen] = useState(false);
  const [artistDropdownOpen, setArtistDropdownOpen] = useState(false);
  const [yearDropdownOpen, setYearDropdownOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const genreDropdownRef = useRef<HTMLDivElement>(null);
  const artistDropdownRef = useRef<HTMLDivElement>(null);
  const yearDropdownRef = useRef<HTMLDivElement>(null);

  const allGenres = Array.from(new Set(albums.flatMap((a) => a.genres))).sort();
  const allArtists = Array.from(new Set(albums.map((a) => a.artist))).sort();
  const allYears = Array.from(new Set(albums.map((a) => a.year))).sort((a, b) => b - a);

  const filtered = albums.filter((album) => {
    const genreMatch = selectedGenre === 'All' || album.genres.includes(selectedGenre);
    const artistMatch = selectedArtist === 'All' || album.artist === selectedArtist;
    const yearMatch = selectedYear === 'All' || album.year === selectedYear;
    return genreMatch && artistMatch && yearMatch;
  });

  // Set up Intersection Observer
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const albumId = entry.target.getAttribute('data-album-id') || '';
            setVisibleItems((prev) => new Set([...prev, albumId]));
          }
        });
      },
      {
        threshold: 0,
        rootMargin: '100px',
      }
    );

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  // Scroll to top button visibility
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Reset visibility when filters change
  useEffect(() => {
    setVisibleItems(new Set());

    // Disconnect and reconnect observer to ensure fresh observation
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Re-initialize observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const albumId = entry.target.getAttribute('data-album-id') || '';
            setVisibleItems((prev) => new Set([...prev, albumId]));
          }
        });
      },
      {
        threshold: 0,
        rootMargin: '100px',
      }
    );
  }, [selectedGenre, selectedArtist, selectedYear]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (genreDropdownRef.current && !genreDropdownRef.current.contains(event.target as Node)) {
        setGenreDropdownOpen(false);
      }
      if (artistDropdownRef.current && !artistDropdownRef.current.contains(event.target as Node)) {
        setArtistDropdownOpen(false);
      }
      if (yearDropdownRef.current && !yearDropdownRef.current.contains(event.target as Node)) {
        setYearDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Observe elements when they mount
  const setElementRef = (element: HTMLDivElement | null, albumId: string) => {
    if (element && observerRef.current) {
      element.setAttribute('data-album-id', albumId);
      observerRef.current.observe(element);
    }
  };

  const openModal = (cover: string) => {
    setModalImage(cover);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setTimeout(() => setModalImage(null), 300);
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">{t('title')}</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 font-light">{t('subtitle')}</p>
      </div>

      <div className="flex flex-wrap gap-3 mb-8">
        {/* Genre Dropdown */}
        <div className="relative" ref={genreDropdownRef}>
          <button
            onClick={() => setGenreDropdownOpen(!genreDropdownOpen)}
            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm font-medium bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            aria-expanded={genreDropdownOpen}
          >
            <span className="truncate max-w-24 sm:max-w-32">
              {selectedGenre === 'All' ? t('allGenres') : selectedGenre}
            </span>
            <svg
              className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform ${genreDropdownOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {genreDropdownOpen && (
            <div className="absolute left-0 mt-1 w-40 sm:w-48 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg z-20 max-h-60 overflow-y-auto">
              <button
                onClick={() => {
                  setSelectedGenre('All');
                  setGenreDropdownOpen(false);
                }}
                className={`w-full text-left px-3 sm:px-4 py-2 sm:py-2.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors first:rounded-t-md ${
                  selectedGenre === 'All'
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    : ''
                }`}
              >
                {t('allGenres')}
                {selectedGenre === 'All' && (
                  <svg
                    className="w-4 h-4 ml-auto inline text-blue-600 dark:text-blue-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
              {allGenres.map((genre) => (
                <button
                  key={genre}
                  onClick={() => {
                    setSelectedGenre(genre);
                    setGenreDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 sm:px-4 py-2 sm:py-2.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors last:rounded-b-md ${
                    selectedGenre === genre
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : ''
                  }`}
                >
                  {genre}
                  {selectedGenre === genre && (
                    <svg
                      className="w-4 h-4 ml-auto inline text-blue-600 dark:text-blue-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Artist Dropdown */}
        <div className="relative" ref={artistDropdownRef}>
          <button
            onClick={() => setArtistDropdownOpen(!artistDropdownOpen)}
            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm font-medium bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            aria-expanded={artistDropdownOpen}
          >
            <span className="truncate max-w-24 sm:max-w-32">
              {selectedArtist === 'All' ? t('allArtists') : selectedArtist}
            </span>
            <svg
              className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform ${artistDropdownOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {artistDropdownOpen && (
            <div className="absolute left-0 mt-1 w-40 sm:w-48 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg z-20 max-h-60 overflow-y-auto">
              <button
                onClick={() => {
                  setSelectedArtist('All');
                  setArtistDropdownOpen(false);
                }}
                className={`w-full text-left px-3 sm:px-4 py-2 sm:py-2.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors first:rounded-t-md ${
                  selectedArtist === 'All'
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    : ''
                }`}
              >
                {t('allArtists')}
                {selectedArtist === 'All' && (
                  <svg
                    className="w-4 h-4 ml-auto inline text-blue-600 dark:text-blue-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
              {allArtists.map((artist) => (
                <button
                  key={artist}
                  onClick={() => {
                    setSelectedArtist(artist);
                    setArtistDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 sm:px-4 py-2 sm:py-2.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors last:rounded-b-md ${
                    selectedArtist === artist
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : ''
                  }`}
                >
                  {artist}
                  {selectedArtist === artist && (
                    <svg
                      className="w-4 h-4 ml-auto inline text-blue-600 dark:text-blue-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Year Dropdown */}
        <div className="relative" ref={yearDropdownRef}>
          <button
            onClick={() => setYearDropdownOpen(!yearDropdownOpen)}
            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm font-medium bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            aria-expanded={yearDropdownOpen}
          >
            <span className="truncate max-w-24 sm:max-w-32">
              {selectedYear === 'All' ? t('allYears') : selectedYear}
            </span>
            <svg
              className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform ${yearDropdownOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {yearDropdownOpen && (
            <div className="absolute left-0 mt-1 w-40 sm:w-48 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg z-20 max-h-60 overflow-y-auto">
              <button
                onClick={() => {
                  setSelectedYear('All');
                  setYearDropdownOpen(false);
                }}
                className={`w-full text-left px-3 sm:px-4 py-2 sm:py-2.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors first:rounded-t-md ${
                  selectedYear === 'All'
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    : ''
                }`}
              >
                {t('allYears')}
                {selectedYear === 'All' && (
                  <svg
                    className="w-4 h-4 ml-auto inline text-blue-600 dark:text-blue-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
              {allYears.map((year) => (
                <button
                  key={year}
                  onClick={() => {
                    setSelectedYear(year);
                    setYearDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 sm:px-4 py-2 sm:py-2.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors last:rounded-b-md ${
                    selectedYear === year
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : ''
                  }`}
                >
                  {year}
                  {selectedYear === year && (
                    <svg
                      className="w-4 h-4 ml-auto inline text-blue-600 dark:text-blue-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Results count */}
        <div className="flex items-center px-2 sm:px-3 py-1.5 sm:py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
          {filtered.length} {filtered.length === 1 ? t('album') : t('albums')}
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
        {filtered.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-16 px-4">
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
              {t('noResults')}
            </h3>
            <p className="text-gray-500 dark:text-gray-500 text-center max-w-md">
              {t('noResultsDescription')}
            </p>
            <button
              onClick={() => {
                setSelectedGenre('All');
                setSelectedArtist('All');
                setSelectedYear('All');
              }}
              className="mt-6 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-200 text-sm font-medium cursor-pointer"
            >
              {t('clearFilters')}
            </button>
          </div>
        ) : (
          filtered.map((album, i) => {
            const albumId = `${album.title}-${album.artist}`.replace(/\s+/g, '-').toLowerCase();

            return (
              <div
                key={albumId}
                ref={(el) => setElementRef(el, albumId)}
                className={clsx(
                  'rounded-lg bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-all duration-500 overflow-hidden',
                  {
                    'opacity-100 translate-y-0': visibleItems.has(albumId),
                    'opacity-0 translate-y-4': !visibleItems.has(albumId),
                  }
                )}
                style={{ transitionDelay: `${(i % 3) * 50}ms` }}
              >
                <div className="p-4">
                  <div
                    className="relative w-full aspect-square overflow-hidden rounded-md cursor-pointer"
                    onClick={() => openModal(album.cover)}
                  >
                    <Image
                      src={album.cover}
                      alt={t('coverAlt', { title: album.title })}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                      className="object-cover rounded-md"
                    />
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-1">{album.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{album.artist}</p>
                  <div className="mt-2 flex flex-wrap gap-1 text-xs">
                    {album.genres.map((g) => (
                      <span
                        key={g}
                        className="px-2 py-0.5 rounded-full bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-white"
                      >
                        {g}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 line-clamp-4">
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
                        <Image
                          src="/icons/spotify.svg"
                          alt={t('spotifyIcon')}
                          width={20}
                          height={20}
                          className="inline-block"
                        />
                        {t('listenOnSpotify')}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className={clsx(
          'fixed bottom-6 right-6 p-3 rounded-full bg-black hover:bg-gray-800 text-white shadow-lg transition-all duration-300 z-30 cursor-pointer',
          {
            'opacity-100 translate-y-0': showScrollTop,
            'opacity-0 translate-y-4 pointer-events-none': !showScrollTop,
          }
        )}
        aria-label="Scroll to top"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 10l7-7m0 0l7 7m-7-7v18"
          />
        </svg>
      </button>

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
          <div className="relative w-[90vw] max-w-xl aspect-square">
            <Image
              src={modalImage}
              alt={t('modalAlt')}
              fill
              sizes="90vw"
              className="rounded-lg object-contain shadow-xl transition-transform duration-300"
            />
          </div>
        </div>
      )}
    </div>
  );
}
