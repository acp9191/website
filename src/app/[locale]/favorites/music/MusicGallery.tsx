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
  const [modalAnimation, setModalAnimation] = useState<'entering' | 'visible' | 'leaving'>(
    'entering'
  );
  const [visibleItems, setVisibleItems] = useState<Set<string>>(new Set());
  const [headerVisible, setHeaderVisible] = useState(false);
  const [genreDropdownOpen, setGenreDropdownOpen] = useState(false);
  const [artistDropdownOpen, setArtistDropdownOpen] = useState(false);
  const [yearDropdownOpen, setYearDropdownOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const headerObserverRef = useRef<IntersectionObserver | null>(null);
  const headerRef = useRef<HTMLDivElement>(null);
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

  // Set up Intersection Observer for header
  useEffect(() => {
    headerObserverRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setHeaderVisible(true);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
      }
    );

    if (headerRef.current) {
      headerObserverRef.current.observe(headerRef.current);
    }

    return () => {
      if (headerObserverRef.current) {
        headerObserverRef.current.disconnect();
      }
    };
  }, []);

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

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showModal) {
        closeModal();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showModal]); // Add closeModal as dependency if needed

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
    setModalAnimation('entering');
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';

    // Trigger animation after a brief delay
    setTimeout(() => {
      setModalAnimation('visible');
    }, 10);
  };

  const closeModal = () => {
    setModalAnimation('leaving');
    // Restore body scroll
    document.body.style.overflow = 'unset';

    setTimeout(() => {
      setShowModal(false);
      setModalImage(null);
      setModalAnimation('entering');
    }, 300);
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div
        ref={headerRef}
        className={clsx('text-center mb-8 transition-all duration-700 ease-out', {
          'opacity-100 translate-y-0': headerVisible,
          'opacity-0 translate-y-8': !headerVisible,
        })}
      >
        <h1
          className={clsx(
            'text-4xl font-bold text-gray-900 dark:text-white mb-3 transition-all duration-700 ease-out',
            {
              'opacity-100 translate-y-0': headerVisible,
              'opacity-0 translate-y-4': !headerVisible,
            }
          )}
          style={{ transitionDelay: '100ms' }}
        >
          {t('title')}
        </h1>
        <p
          className={clsx(
            'text-xl text-gray-600 dark:text-gray-400 font-light transition-all duration-700 ease-out',
            {
              'opacity-100 translate-y-0': headerVisible,
              'opacity-0 translate-y-4': !headerVisible,
            }
          )}
          style={{ transitionDelay: '200ms' }}
        >
          {t('subtitle')}
        </p>
      </div>

      <div
        className={clsx(
          'flex flex-col sm:flex-row flex-wrap gap-3 mb-8 transition-all duration-700 ease-out relative z-10',
          {
            'opacity-100 translate-y-0': headerVisible,
            'opacity-0 translate-y-4': !headerVisible,
          }
        )}
        style={{ transitionDelay: '300ms' }}
      >
        <div className="flex flex-wrap gap-3 flex-1">
          {/* Genre Dropdown */}
          <div
            className="relative min-w-0 flex-1 sm:flex-initial sm:min-w-[140px]"
            ref={genreDropdownRef}
          >
            <button
              onClick={() => setGenreDropdownOpen(!genreDropdownOpen)}
              className="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm hover:shadow-md"
              aria-expanded={genreDropdownOpen}
            >
              <span className="truncate text-left">
                {selectedGenre === 'All' ? t('allGenres') : selectedGenre}
              </span>
              <svg
                className={`w-4 h-4 transition-transform duration-200 flex-shrink-0 ${
                  genreDropdownOpen ? 'rotate-180' : ''
                }`}
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
              <div className="absolute left-0 right-0 sm:left-0 sm:right-auto sm:w-64 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl z-[100] max-h-64 overflow-y-auto">
                <div className="py-1">
                  <button
                    onClick={() => {
                      setSelectedGenre('All');
                      setGenreDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-between ${
                      selectedGenre === 'All'
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'text-gray-900 dark:text-gray-100'
                    }`}
                  >
                    <span>{t('allGenres')}</span>
                    {selectedGenre === 'All' && (
                      <svg
                        className="w-4 h-4 text-blue-600 dark:text-blue-400"
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
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-between ${
                        selectedGenre === genre
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                          : 'text-gray-900 dark:text-gray-100'
                      }`}
                    >
                      <span>{genre}</span>
                      {selectedGenre === genre && (
                        <svg
                          className="w-4 h-4 text-blue-600 dark:text-blue-400"
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
              </div>
            )}
          </div>

          {/* Artist Dropdown */}
          <div
            className="relative min-w-0 flex-1 sm:flex-initial sm:min-w-[140px]"
            ref={artistDropdownRef}
          >
            <button
              onClick={() => setArtistDropdownOpen(!artistDropdownOpen)}
              className="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm hover:shadow-md"
              aria-expanded={artistDropdownOpen}
            >
              <span className="truncate text-left">
                {selectedArtist === 'All' ? t('allArtists') : selectedArtist}
              </span>
              <svg
                className={`w-4 h-4 transition-transform duration-200 flex-shrink-0 ${
                  artistDropdownOpen ? 'rotate-180' : ''
                }`}
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
              <div className="absolute left-0 right-0 sm:left-0 sm:right-auto sm:w-64 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl z-[100] max-h-64 overflow-y-auto">
                <div className="py-1">
                  <button
                    onClick={() => {
                      setSelectedArtist('All');
                      setArtistDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-between ${
                      selectedArtist === 'All'
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'text-gray-900 dark:text-gray-100'
                    }`}
                  >
                    <span>{t('allArtists')}</span>
                    {selectedArtist === 'All' && (
                      <svg
                        className="w-4 h-4 text-blue-600 dark:text-blue-400"
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
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-between ${
                        selectedArtist === artist
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                          : 'text-gray-900 dark:text-gray-100'
                      }`}
                    >
                      <span>{artist}</span>
                      {selectedArtist === artist && (
                        <svg
                          className="w-4 h-4 text-blue-600 dark:text-blue-400"
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
              </div>
            )}
          </div>

          {/* Year Dropdown */}
          <div
            className="relative min-w-0 flex-1 sm:flex-initial sm:min-w-[120px]"
            ref={yearDropdownRef}
          >
            <button
              onClick={() => setYearDropdownOpen(!yearDropdownOpen)}
              className="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm hover:shadow-md"
              aria-expanded={yearDropdownOpen}
            >
              <span className="truncate text-left">
                {selectedYear === 'All' ? t('allYears') : selectedYear}
              </span>
              <svg
                className={`w-4 h-4 transition-transform duration-200 flex-shrink-0 ${
                  yearDropdownOpen ? 'rotate-180' : ''
                }`}
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
              <div className="absolute left-0 right-0 sm:left-0 sm:right-auto sm:w-48 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl z-[100] max-h-64 overflow-y-auto">
                <div className="py-1">
                  <button
                    onClick={() => {
                      setSelectedYear('All');
                      setYearDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-between ${
                      selectedYear === 'All'
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'text-gray-900 dark:text-gray-100'
                    }`}
                  >
                    <span>{t('allYears')}</span>
                    {selectedYear === 'All' && (
                      <svg
                        className="w-4 h-4 text-blue-600 dark:text-blue-400"
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
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-between ${
                        selectedYear === year
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                          : 'text-gray-900 dark:text-gray-100'
                      }`}
                    >
                      <span>{year}</span>
                      {selectedYear === year && (
                        <svg
                          className="w-4 h-4 text-blue-600 dark:text-blue-400"
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
              </div>
            )}
          </div>
        </div>

        {/* Results count - styled as a badge */}
        <div className="flex items-center justify-center sm:justify-end">
          <div className="inline-flex items-center gap-2 px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-900 dark:text-white shadow-sm">
            <svg
              className="w-4 h-4 text-gray-500 dark:text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
            <span>
              {filtered.length} {filtered.length === 1 ? t('album') : t('albums')}
            </span>
          </div>
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

      {modalImage && showModal && (
        <div
          onClick={closeModal}
          className={clsx(
            'fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ease-out',
            {
              'backdrop-blur-sm bg-black/60': modalAnimation === 'visible',
              'backdrop-blur-none bg-black/0':
                modalAnimation === 'entering' || modalAnimation === 'leaving',
            }
          )}
        >
          <div
            className={clsx(
              'relative max-w-xl max-h-[70vh] w-full transition-all duration-300 ease-out',
              {
                'scale-100 opacity-100': modalAnimation === 'visible',
                'scale-75 opacity-0': modalAnimation === 'entering',
                'scale-90 opacity-0': modalAnimation === 'leaving',
              }
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full aspect-square">
              <Image
                src={modalImage}
                alt="Album cover enlarged view"
                fill
                sizes="(max-width: 768px) 70vw, 50vw"
                className="rounded-xl object-contain shadow-2xl"
                priority
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
