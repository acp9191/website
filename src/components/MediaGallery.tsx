'use client';

import { useState, useEffect, useRef } from 'react';
import clsx from 'clsx';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

// Generic item interface
export interface MediaItem {
  title: string;
  subtitle: string; // artist, director, author, etc.
  cover: string;
  description: string;
  year: number;
  categories: string[]; // genres, tags, etc.
  type: 'music' | 'movie' | 'book'; // Add type field
  externalLink?: {
    url: string;
    label: string;
    icon: string;
  };
}

// Filter configuration
export interface FilterConfig {
  categoryLabel: string; // "allGenres", "allTags", etc.
  subtitleLabel: string; // "allArtists", "allDirectors", etc.
  yearLabel: string; // "allYears"
  resetLabel: string; // "reset"
  itemSingular: string; // "album", "movie", "book"
  itemPlural: string; // "albums", "movies", "books"
  aspectRatio: 'square' | 'portrait' | 'auto'; // New property for aspect ratio
}

interface MediaGalleryProps {
  items: MediaItem[];
  filterConfig: FilterConfig;
  translationNamespace: string;
}

export default function MediaGallery({
  items,
  filterConfig,
  translationNamespace,
}: MediaGalleryProps) {
  const t = useTranslations(translationNamespace);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSubtitle, setSelectedSubtitle] = useState('All');
  const [selectedYear, setSelectedYear] = useState<number | 'All'>('All');
  const [modalImage, setModalImage] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalAnimation, setModalAnimation] = useState<'entering' | 'visible' | 'leaving'>(
    'entering'
  );
  const [visibleItems, setVisibleItems] = useState<Set<string>>(new Set());
  const [headerVisible, setHeaderVisible] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [subtitleDropdownOpen, setSubtitleDropdownOpen] = useState(false);
  const [yearDropdownOpen, setYearDropdownOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const headerObserverRef = useRef<IntersectionObserver | null>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const subtitleDropdownRef = useRef<HTMLDivElement>(null);
  const yearDropdownRef = useRef<HTMLDivElement>(null);

  const allCategories = Array.from(new Set(items.flatMap((item) => item.categories))).sort();
  const allSubtitles = Array.from(new Set(items.map((item) => item.subtitle))).sort();
  const allYears = Array.from(new Set(items.map((item) => item.year))).sort((a, b) => b - a);
  const hasActiveFilters =
    selectedCategory !== 'All' || selectedSubtitle !== 'All' || selectedYear !== 'All';

  const resetFilters = () => {
    setSelectedCategory('All');
    setSelectedSubtitle('All');
    setSelectedYear('All');
  };

  // Modified filter selection functions to reset other filters
  const selectCategory = (category: string) => {
    setSelectedCategory(category);
    setSelectedSubtitle('All');
    setSelectedYear('All');
    setCategoryDropdownOpen(false);
  };

  const selectSubtitle = (subtitle: string) => {
    setSelectedSubtitle(subtitle);
    setSelectedCategory('All');
    setSelectedYear('All');
    setSubtitleDropdownOpen(false);
  };

  const selectYear = (year: number | 'All') => {
    setSelectedYear(year);
    setSelectedCategory('All');
    setSelectedSubtitle('All');
    setYearDropdownOpen(false);
  };

  const filtered = items.filter((item) => {
    const categoryMatch = selectedCategory === 'All' || item.categories.includes(selectedCategory);
    const subtitleMatch = selectedSubtitle === 'All' || item.subtitle === selectedSubtitle;
    const yearMatch = selectedYear === 'All' || item.year === selectedYear;
    return categoryMatch && subtitleMatch && yearMatch;
  });

  // Get aspect ratio classes based on config
  const getAspectRatioClasses = () => {
    switch (filterConfig.aspectRatio) {
      case 'square':
        return 'aspect-square';
      case 'portrait':
        return 'aspect-[3/4]'; // Common movie poster/book ratio
      case 'auto':
        return 'aspect-auto'; // Let the image determine the aspect ratio
      default:
        return 'aspect-square';
    }
  };

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
            const itemId = entry.target.getAttribute('data-item-id') || '';
            setVisibleItems((prev) => new Set([...prev, itemId]));
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
  }, [showModal]);

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
            const itemId = entry.target.getAttribute('data-item-id') || '';
            setVisibleItems((prev) => new Set([...prev, itemId]));
          }
        });
      },
      {
        threshold: 0,
        rootMargin: '100px',
      }
    );
  }, [selectedCategory, selectedSubtitle, selectedYear]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(event.target as Node)
      ) {
        setCategoryDropdownOpen(false);
      }
      if (
        subtitleDropdownRef.current &&
        !subtitleDropdownRef.current.contains(event.target as Node)
      ) {
        setSubtitleDropdownOpen(false);
      }
      if (yearDropdownRef.current && !yearDropdownRef.current.contains(event.target as Node)) {
        setYearDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Observe elements when they mount
  const setElementRef = (element: HTMLDivElement | null, itemId: string) => {
    if (element && observerRef.current) {
      element.setAttribute('data-item-id', itemId);
      observerRef.current.observe(element);
    }
  };

  const openModal = (cover: string) => {
    setModalImage(cover);
    setShowModal(true);
    setModalAnimation('entering');
    document.body.style.overflow = 'hidden';

    setTimeout(() => {
      setModalAnimation('visible');
    }, 10);
  };

  const closeModal = () => {
    setModalAnimation('leaving');
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
        {/* Results count and reset integrated into header */}
        <div
          className={clsx(
            'inline-flex items-center gap-3 mt-4 transition-all duration-700 ease-out',
            {
              'opacity-100 translate-y-0': headerVisible,
              'opacity-0 translate-y-4': !headerVisible,
            }
          )}
          style={{ transitionDelay: '250ms' }}
        >
          {/* Count badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300">
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
              {filtered.length}{' '}
              {filtered.length === 1 ? t(filterConfig.itemSingular) : t(filterConfig.itemPlural)}
            </span>
          </div>

          {/* Reset button with seamless fade */}
          <div
            className={clsx('overflow-hidden transition-all duration-300 ease-out', {
              'opacity-100 max-w-xs translate-x-0': hasActiveFilters,
              'opacity-0 max-w-0 -translate-x-2': !hasActiveFilters,
            })}
          >
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-500 text-sm font-medium shadow-sm hover:shadow-md cursor-pointer whitespace-nowrap"
              disabled={!hasActiveFilters}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span>{t(filterConfig.resetLabel)}</span>
            </button>
          </div>
        </div>
      </div>

      <div
        className={clsx(
          'flex flex-col gap-3 mb-8 transition-all duration-700 ease-out relative z-10',
          {
            'opacity-100 translate-y-0': headerVisible,
            'opacity-0 translate-y-4': !headerVisible,
          }
        )}
        style={{ transitionDelay: '300ms' }}
      >
        {/* Main filters row */}
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-1">
          {/* Category Dropdown */}
          <div className="relative w-full sm:flex-1" ref={categoryDropdownRef}>
            <button
              onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
              className="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm hover:shadow-md cursor-pointer"
              aria-expanded={categoryDropdownOpen}
            >
              <span className="truncate text-left min-w-0">
                {selectedCategory === 'All' ? t(filterConfig.categoryLabel) : selectedCategory}
              </span>
              <svg
                className={`w-4 h-4 transition-transform duration-200 flex-shrink-0 ${
                  categoryDropdownOpen ? 'rotate-180' : ''
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

            {categoryDropdownOpen && (
              <div className="absolute left-0 w-full sm:w-64 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl z-[100] max-h-64 overflow-y-auto">
                <div className="py-1">
                  {allCategories.map((category) => (
                    <button
                      key={category}
                      onClick={() => selectCategory(category)}
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-between cursor-pointer ${
                        selectedCategory === category
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                          : 'text-gray-900 dark:text-gray-100'
                      }`}
                    >
                      <span className="truncate min-w-0">{category}</span>
                      {selectedCategory === category && (
                        <svg
                          className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 ml-2"
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

          {/* Subtitle Dropdown */}
          <div className="relative w-full sm:flex-1" ref={subtitleDropdownRef}>
            <button
              onClick={() => setSubtitleDropdownOpen(!subtitleDropdownOpen)}
              className="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm hover:shadow-md cursor-pointer"
              aria-expanded={subtitleDropdownOpen}
            >
              <span className="truncate text-left min-w-0">
                {selectedSubtitle === 'All' ? t(filterConfig.subtitleLabel) : selectedSubtitle}
              </span>
              <svg
                className={`w-4 h-4 transition-transform duration-200 flex-shrink-0 ${
                  subtitleDropdownOpen ? 'rotate-180' : ''
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

            {subtitleDropdownOpen && (
              <div className="absolute left-0 w-full sm:w-64 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl z-[100] max-h-64 overflow-y-auto">
                <div className="py-1">
                  {allSubtitles.map((subtitle) => (
                    <button
                      key={subtitle}
                      onClick={() => selectSubtitle(subtitle)}
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-between cursor-pointer ${
                        selectedSubtitle === subtitle
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                          : 'text-gray-900 dark:text-gray-100'
                      }`}
                    >
                      <span className="truncate min-w-0">{subtitle}</span>
                      {selectedSubtitle === subtitle && (
                        <svg
                          className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 ml-2"
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
          <div className="relative w-full sm:flex-1" ref={yearDropdownRef}>
            <button
              onClick={() => setYearDropdownOpen(!yearDropdownOpen)}
              className="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm hover:shadow-md cursor-pointer"
              aria-expanded={yearDropdownOpen}
            >
              <span className="truncate text-left min-w-0">
                {selectedYear === 'All' ? t(filterConfig.yearLabel) : selectedYear}
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
              <div className="absolute left-0 w-full sm:w-48 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl z-[100] max-h-64 overflow-y-auto">
                <div className="py-1">
                  {allYears.map((year) => (
                    <button
                      key={year}
                      onClick={() => selectYear(year)}
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-between cursor-pointer ${
                        selectedYear === year
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                          : 'text-gray-900 dark:text-gray-100'
                      }`}
                    >
                      <span>{year}</span>
                      {selectedYear === year && (
                        <svg
                          className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0"
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
      </div>

      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
        {filtered.map((item, i) => {
          const itemId = `${item.title}-${item.subtitle}`.replace(/\s+/g, '-').toLowerCase();

          return (
            <div
              key={itemId}
              ref={(el) => setElementRef(el, itemId)}
              className={clsx(
                'rounded-lg bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-all duration-500 overflow-hidden',
                {
                  'opacity-100 translate-y-0': visibleItems.has(itemId),
                  'opacity-0 translate-y-4': !visibleItems.has(itemId),
                }
              )}
              style={{ transitionDelay: `${(i % 3) * 50}ms` }}
            >
              <div className="p-4">
                <div
                  className={clsx(
                    'relative w-full overflow-hidden rounded-md cursor-pointer',
                    filterConfig.aspectRatio === 'auto' ? 'h-auto' : getAspectRatioClasses()
                  )}
                  onClick={() => openModal(item.cover)}
                >
                  <Image
                    src={item.cover}
                    alt={t('coverAlt', { title: item.title })}
                    width={filterConfig.aspectRatio === 'auto' ? 400 : undefined}
                    height={filterConfig.aspectRatio === 'auto' ? 600 : undefined}
                    fill={filterConfig.aspectRatio !== 'auto'}
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                    className={clsx(
                      'rounded-md',
                      filterConfig.aspectRatio === 'auto' ? 'w-full h-auto' : 'object-cover'
                    )}
                  />
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-1">{item.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{item.subtitle}</p>
                <div className="mt-2 flex flex-wrap gap-1 text-xs">
                  {item.categories.map((category) => (
                    <span
                      key={category}
                      className="px-2 py-0.5 rounded-full bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-white"
                    >
                      {category}
                    </span>
                  ))}
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 line-clamp-4">
                  {item.description}
                </p>
                {item.externalLink && (
                  <div className="mt-3">
                    <a
                      href={item.externalLink.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-2 hover:underline text-sm ${
                        item.type === 'music'
                          ? 'text-green-600'
                          : item.type === 'movie'
                            ? 'text-red-600'
                            : 'text-blue-600'
                      }`}
                    >
                      <Image
                        src={item.externalLink.icon}
                        alt={item.externalLink.label}
                        width={20}
                        height={20}
                        className="inline-block"
                      />
                      {item.externalLink.label}
                    </a>
                  </div>
                )}
              </div>
            </div>
          );
        })}
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
            className={clsx('relative transition-all duration-300 ease-out', {
              'scale-100 opacity-100': modalAnimation === 'visible',
              'scale-75 opacity-0': modalAnimation === 'entering',
              'scale-90 opacity-0': modalAnimation === 'leaving',
            })}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={modalImage}
              alt="Cover enlarged view"
              className="rounded-xl object-contain shadow-2xl max-w-[70vw] max-h-[70vh] w-auto h-auto"
            />
          </div>
        </div>
      )}
    </div>
  );
}
