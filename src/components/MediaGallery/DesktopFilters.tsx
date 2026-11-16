import { useState, useEffect, useRef } from 'react';
import clsx from 'clsx';
import { AnimatedCounter } from '../AnimatedCounter';
import FilterDropdown, { FilterValue } from './FilterDropdown';
import { MediaItem, FilterConfig, FilterState, Translate } from './types';

interface DesktopFiltersProps {
  filterConfig: FilterConfig;
  filterState: FilterState;
  filterData: {
    allCategories: string[];
    allSubtitles: string[];
    allYears: number[];
    hasActiveFilters: boolean;
  };
  filtered: MediaItem[];
  /** Translator for the gallery's own namespace (Music / Movies / Books). */
  t: Translate;
  /** Translator for the shared `Gallery` namespace. */
  tGallery: Translate;
}

export function DesktopFilters({
  filterConfig,
  filterState,
  filterData,
  filtered,
  t,
  tGallery,
}: DesktopFiltersProps) {
  const [sidebarSticky, setSidebarSticky] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [subtitleDropdownOpen, setSubtitleDropdownOpen] = useState(false);
  const [yearDropdownOpen, setYearDropdownOpen] = useState(false);

  const sidebarSentinelRef = useRef<HTMLDivElement>(null);

  /*
    The sticky sentinel toggles both ways as it crosses the header offset.
  */
  useEffect(() => {
    const sentinel = sidebarSentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setSidebarSticky(!entry.isIntersecting);
        });
      },
      { threshold: 0, rootMargin: '-80px 0px 0px 0px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  /*
    The three filters combine. MediaGallery already ANDs them when computing
    `filtered`; these handlers used to clear the other two on every selection,
    so that capability was unreachable and picking a genre silently dropped a
    year the user had chosen.
  */
  const handleCategorySelect = (value: FilterValue) => {
    filterState.setSelectedCategory(String(value));
  };

  const handleSubtitleSelect = (value: FilterValue) => {
    filterState.setSelectedSubtitle(String(value));
  };

  const handleYearSelect = (value: FilterValue) => {
    filterState.setSelectedYear(value === 'All' ? 'All' : Number(value));
  };

  return (
    <div className="hidden lg:block w-72 flex-shrink-0">
      <div ref={sidebarSentinelRef} className="h-0" />

      <div
        className={clsx('w-72 transition-all duration-300 ease-out', {
          'sticky top-20': sidebarSticky,
          relative: !sidebarSticky,
        })}
      >
        <div
          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm animate-fade-up"
          style={{ animationDelay: '300ms' }}
        >
          {/* Count Badge */}
          <div className="mb-6">
            <div
              className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-gray-100 dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-300 w-full justify-center animate-fade-up"
              style={{ animationDelay: '400ms' }}
            >
              <svg
                className="w-4 h-4 text-gray-500 dark:text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
              <span>
                <AnimatedCounter value={filtered.length} />{' '}
                {t(filterConfig.countKey, { count: filtered.length })}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {/* Filter Dropdowns */}
            <FilterDropdown
              label={tGallery('genre')}
              ariaLabel={tGallery('filterBy', { label: tGallery('genre') })}
              allLabel={t('all')}
              selectedValue={filterState.selectedCategory}
              options={['All', ...filterData.allCategories]}
              onSelect={handleCategorySelect}
              isOpen={categoryDropdownOpen}
              setIsOpen={setCategoryDropdownOpen}
              delay="600ms"
            />

            <FilterDropdown
              label={t(filterConfig.subtitleLabel)}
              ariaLabel={tGallery('filterBy', { label: t(filterConfig.subtitleLabel) })}
              allLabel={t('all')}
              selectedValue={filterState.selectedSubtitle}
              options={['All', ...filterData.allSubtitles]}
              onSelect={handleSubtitleSelect}
              isOpen={subtitleDropdownOpen}
              setIsOpen={setSubtitleDropdownOpen}
              delay="700ms"
            />

            <FilterDropdown
              label={tGallery('year')}
              ariaLabel={tGallery('filterBy', { label: tGallery('year') })}
              allLabel={t('all')}
              selectedValue={filterState.selectedYear}
              options={['All', ...filterData.allYears]}
              onSelect={handleYearSelect}
              isOpen={yearDropdownOpen}
              setIsOpen={setYearDropdownOpen}
              delay="800ms"
            />

            {/* Reset Button */}
            <div className="mt-6 animate-fade-up" style={{ animationDelay: '900ms' }}>
              <button
                onClick={filterState.resetFilters}
                disabled={!filterData.hasActiveFilters}
                className={clsx(
                  'w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium shadow-sm transition-all duration-200 group',
                  {
                    // Active state (filters applied)
                    'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 hover:shadow-md cursor-pointer':
                      filterData.hasActiveFilters,
                    // Disabled state (no filters applied)
                    'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed':
                      !filterData.hasActiveFilters,
                  }
                )}
              >
                <svg
                  className={clsx('w-4 h-4 transition-transform duration-300', {
                    'group-hover:rotate-180': filterData.hasActiveFilters,
                    'opacity-50': !filterData.hasActiveFilters,
                  })}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                <span>{tGallery('reset')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
