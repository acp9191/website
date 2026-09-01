import { useState } from 'react';
import clsx from 'clsx';
import { useRevealOnScroll } from '@/src/hooks/useRevealOnScroll';
import { AnimatedCounter } from '../AnimatedCounter';
import FilterDropdown, { type FilterValue } from './FilterDropdown';
import { MediaItem, FilterConfig, FilterState, Translate } from './types';

interface MobileFiltersProps {
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

export function MobileFilters({
  filterConfig,
  filterState,
  filterData,
  filtered,
  t,
  tGallery,
}: MobileFiltersProps) {
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [subtitleDropdownOpen, setSubtitleDropdownOpen] = useState(false);
  const [yearDropdownOpen, setYearDropdownOpen] = useState(false);
  const { visible, ref: filtersRef } = useRevealOnScroll();

  // The three filters combine; MediaGallery already ANDs them. Clearing the
  // siblings here made that unreachable and silently discarded the user's
  // other selections.
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
    <div ref={filtersRef} className="lg:hidden w-full mb-8">
      <div className="flex flex-col gap-3">
        {/* Count badge */}
        <div
          className={clsx('text-center transition-all duration-700 ease-out', {
            'opacity-100 translate-y-0': visible,
            'opacity-0 translate-y-4': !visible,
          })}
          style={{ transitionDelay: '200ms' }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300">
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

          <div
            className={clsx('inline-block ml-3 transition-all duration-700 ease-out', {
              'opacity-100 translate-y-0': visible,
              'opacity-0 translate-y-4': !visible,
            })}
            style={{ transitionDelay: '300ms' }}
          >
            <button
              onClick={filterState.resetFilters}
              disabled={!filterData.hasActiveFilters}
              className={clsx(
                'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium shadow-sm transition-all duration-200',
                {
                  // Active state (filters applied)
                  'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-md cursor-pointer':
                    filterData.hasActiveFilters,
                  // Disabled state (no filters applied)
                  'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed':
                    !filterData.hasActiveFilters,
                }
              )}
            >
              <svg
                className="w-4 h-4"
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

        {/*
          Same control as the desktop sidebar, in its `bar` dress. Only one
          panel may be open at a time here, since they sit side by side and
          overlap when open — hence `onOpen` closing the siblings.
        */}
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-1">
          <FilterDropdown
            variant="bar"
            label={tGallery('genre')}
            ariaLabel={tGallery('filterBy', { label: tGallery('genre') })}
            allLabel={t('all')}
            options={['All', ...filterData.allCategories]}
            selectedValue={filterState.selectedCategory}
            onSelect={handleCategorySelect}
            isOpen={categoryDropdownOpen}
            setIsOpen={setCategoryDropdownOpen}
            onOpen={() => {
              setSubtitleDropdownOpen(false);
              setYearDropdownOpen(false);
            }}
            visible={visible}
            delay="400ms"
          />

          <FilterDropdown
            variant="bar"
            label={t(filterConfig.subtitleLabel)}
            ariaLabel={tGallery('filterBy', { label: t(filterConfig.subtitleLabel) })}
            allLabel={t('all')}
            options={['All', ...filterData.allSubtitles]}
            selectedValue={filterState.selectedSubtitle}
            onSelect={handleSubtitleSelect}
            isOpen={subtitleDropdownOpen}
            setIsOpen={setSubtitleDropdownOpen}
            onOpen={() => {
              setCategoryDropdownOpen(false);
              setYearDropdownOpen(false);
            }}
            visible={visible}
            delay="500ms"
          />

          <FilterDropdown
            variant="bar"
            label={tGallery('year')}
            ariaLabel={tGallery('filterBy', { label: tGallery('year') })}
            allLabel={t('all')}
            options={['All', ...filterData.allYears]}
            selectedValue={filterState.selectedYear}
            onSelect={handleYearSelect}
            isOpen={yearDropdownOpen}
            setIsOpen={setYearDropdownOpen}
            onOpen={() => {
              setCategoryDropdownOpen(false);
              setSubtitleDropdownOpen(false);
            }}
            visible={visible}
            delay="600ms"
          />
        </div>
      </div>
    </div>
  );
}
