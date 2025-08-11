import { useState, useEffect, useRef } from 'react';
import clsx from 'clsx';
import { AnimatedCounter } from '../AnimatedCounter';
import { MediaItem, FilterConfig, FilterState } from './types';

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
  t: (key: string) => string;
}

export function MobileFilters({
  filterConfig,
  filterState,
  filterData,
  filtered,
  t,
}: MobileFiltersProps) {
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [subtitleDropdownOpen, setSubtitleDropdownOpen] = useState(false);
  const [yearDropdownOpen, setYearDropdownOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const filtersRef = useRef<HTMLDivElement>(null);

  // Set up intersection observer for fade-in animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
          }
        });
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    if (filtersRef.current) {
      observer.observe(filtersRef.current);
    }

    return () => {
      observer.disconnect();
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

        {/* Mobile filter dropdowns in a row */}
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-1">
          <MobileFilterButton
            label={
              filterState.selectedCategory === 'All'
                ? t(filterConfig.categoryLabel)
                : filterState.selectedCategory
            }
            options={['All', ...filterData.allCategories]}
            selectedValue={filterState.selectedCategory}
            onSelect={handleCategorySelect}
            isOpen={categoryDropdownOpen}
            setIsOpen={setCategoryDropdownOpen}
            closeOthers={() => {
              setSubtitleDropdownOpen(false);
              setYearDropdownOpen(false);
            }}
            visible={visible}
            delay="400ms"
          />

          <MobileFilterButton
            label={
              filterState.selectedSubtitle === 'All'
                ? t(filterConfig.subtitleLabel)
                : filterState.selectedSubtitle
            }
            options={['All', ...filterData.allSubtitles]}
            selectedValue={filterState.selectedSubtitle}
            onSelect={handleSubtitleSelect}
            isOpen={subtitleDropdownOpen}
            setIsOpen={setSubtitleDropdownOpen}
            closeOthers={() => {
              setCategoryDropdownOpen(false);
              setYearDropdownOpen(false);
            }}
            visible={visible}
            delay="500ms"
          />

          <MobileFilterButton
            label={
              filterState.selectedYear === 'All'
                ? t(filterConfig.yearLabel)
                : filterState.selectedYear.toString()
            }
            options={['All', ...filterData.allYears]}
            selectedValue={filterState.selectedYear}
            onSelect={handleYearSelect}
            isOpen={yearDropdownOpen}
            setIsOpen={setYearDropdownOpen}
            closeOthers={() => {
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

interface MobileFilterButtonProps {
  label: string;
  options: (string | number)[];
  selectedValue: string | number | 'All';
  onSelect: (value: any) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  closeOthers: () => void;
  visible: boolean;
  delay: string;
}

function MobileFilterButton({
  label,
  options,
  selectedValue,
  onSelect,
  isOpen,
  setIsOpen,
  closeOthers,
  visible,
  delay,
}: MobileFilterButtonProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, setIsOpen]);

  const handleToggle = () => {
    if (!isOpen) {
      closeOthers();
    }
    setIsOpen(!isOpen);
  };

  const handleSelect = (value: string | number) => {
    onSelect(value);
    setIsOpen(false);
  };

  return (
    <div
      ref={dropdownRef}
      className={clsx('relative w-full sm:flex-1 transition-all duration-700 ease-out', {
        'opacity-100 translate-y-0': visible,
        'opacity-0 translate-y-4': !visible,
        'z-50': isOpen, // Higher z-index when dropdown is open
      })}
      style={{ transitionDelay: delay }}
    >
      <button
        onClick={handleToggle}
        className="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm hover:shadow-md cursor-pointer relative z-10"
        aria-expanded={isOpen}
      >
        <span className="truncate text-left min-w-0">{label}</span>
        <svg
          className={`w-4 h-4 transition-transform duration-200 flex-shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute left-0 w-full sm:w-64 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl z-[9999] max-h-64 overflow-y-auto">
          <div className="py-1">
            {options.map((option) => (
              <button
                key={option}
                onClick={() => handleSelect(option)}
                className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-between cursor-pointer ${
                  selectedValue === option
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    : 'text-gray-900 dark:text-gray-100'
                }`}
              >
                <span className="truncate min-w-0">{option}</span>
                {selectedValue === option && (
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
  );
}
