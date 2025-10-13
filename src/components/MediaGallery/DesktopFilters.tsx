import { useState, useEffect, useRef } from 'react';
import clsx from 'clsx';
import { AnimatedCounter } from '../AnimatedCounter';
import FilterDropdown from './FilterDropdown';
import { MediaItem, FilterConfig, FilterState } from './types';

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
  t: (key: string) => string;
}

export function DesktopFilters({
  filterConfig,
  filterState,
  filterData,
  filtered,
  t,
}: DesktopFiltersProps) {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [sidebarSticky, setSidebarSticky] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [subtitleDropdownOpen, setSubtitleDropdownOpen] = useState(false);
  const [yearDropdownOpen, setYearDropdownOpen] = useState(false);

  const sidebarRef = useRef<HTMLDivElement>(null);
  const sidebarSentinelRef = useRef<HTMLDivElement>(null);
  const sidebarVisibilityRef = useRef<HTMLDivElement>(null);

  // Set up intersection observers for sidebar
  useEffect(() => {
    const sidebarVisibilityObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setSidebarVisible(true);
          }
        });
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    const sidebarStickyObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setSidebarSticky(!entry.isIntersecting);
        });
      },
      { threshold: 0, rootMargin: '-80px 0px 0px 0px' }
    );

    if (sidebarVisibilityRef.current) {
      sidebarVisibilityObserver.observe(sidebarVisibilityRef.current);
    }
    if (sidebarSentinelRef.current) {
      sidebarStickyObserver.observe(sidebarSentinelRef.current);
    }

    return () => {
      sidebarVisibilityObserver.disconnect();
      sidebarStickyObserver.disconnect();
    };
  }, []);

  // Filter handlers that reset other filters
  const handleCategorySelect = (value: string) => {
    filterState.setSelectedCategory(value);
    if (value !== 'All') {
      filterState.setSelectedSubtitle('All');
      filterState.setSelectedYear('All');
    }
  };

  const handleSubtitleSelect = (value: string) => {
    filterState.setSelectedSubtitle(value);
    if (value !== 'All') {
      filterState.setSelectedCategory('All');
      filterState.setSelectedYear('All');
    }
  };

  const handleYearSelect = (value: number | 'All') => {
    filterState.setSelectedYear(value);
    if (value !== 'All') {
      filterState.setSelectedCategory('All');
      filterState.setSelectedSubtitle('All');
    }
  };

  return (
    <div className="hidden lg:block w-72 flex-shrink-0">
      <div ref={sidebarVisibilityRef} className="h-0" />
      <div ref={sidebarSentinelRef} className="h-0" />

      <div
        ref={sidebarRef}
        className={clsx('w-72 transition-all duration-300 ease-out', {
          'sticky top-20': sidebarSticky,
          relative: !sidebarSticky,
        })}
      >
        <div
          className={clsx(
            'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm transition-all duration-700 ease-out',
            {
              'opacity-100 translate-x-0': sidebarVisible,
              'opacity-0 -translate-x-8': !sidebarVisible,
            }
          )}
          style={{ transitionDelay: '300ms' }}
        >
          {/* Count Badge */}
          <div className="mb-6">
            <div
              className={clsx(
                'inline-flex items-center gap-2 px-3 py-2 rounded-full bg-gray-100 dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-300 w-full justify-center transition-all duration-700 ease-out',
                {
                  'opacity-100 translate-y-0': sidebarVisible,
                  'opacity-0 translate-y-4': !sidebarVisible,
                }
              )}
              style={{ transitionDelay: '400ms' }}
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
                {filtered.length === 1 ? t(filterConfig.itemSingular) : t(filterConfig.itemPlural)}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {/* Filter Dropdowns */}
            <FilterDropdown
              label={t(filterConfig.categoryLabel)}
              selectedValue={filterState.selectedCategory}
              options={['All', ...filterData.allCategories]}
              onSelect={handleCategorySelect}
              isOpen={categoryDropdownOpen}
              setIsOpen={setCategoryDropdownOpen}
              visible={sidebarVisible}
              delay="600ms"
            />

            <FilterDropdown
              label={t(filterConfig.subtitleLabel)}
              selectedValue={filterState.selectedSubtitle}
              options={['All', ...filterData.allSubtitles]}
              onSelect={handleSubtitleSelect}
              isOpen={subtitleDropdownOpen}
              setIsOpen={setSubtitleDropdownOpen}
              visible={sidebarVisible}
              delay="700ms"
            />

            <FilterDropdown
              label={t(filterConfig.yearLabel)}
              selectedValue={filterState.selectedYear}
              options={['All', ...filterData.allYears]}
              onSelect={handleYearSelect}
              isOpen={yearDropdownOpen}
              setIsOpen={setYearDropdownOpen}
              visible={sidebarVisible}
              delay="800ms"
            />

            {/* Reset Button */}
            <div
              className={clsx('transition-all duration-700 ease-out mt-6', {
                'opacity-100 translate-y-0': sidebarVisible,
                'opacity-0 translate-y-4': !sidebarVisible,
              })}
              style={{ transitionDelay: '900ms' }}
            >
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
                <span>{t(filterConfig.resetLabel)}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
