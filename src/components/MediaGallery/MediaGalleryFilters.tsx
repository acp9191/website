import { useMemo } from 'react';
import { MediaItem, FilterConfig, FilterState, Translate } from './types';
import { DesktopFilters } from './DesktopFilters';
import { MobileFilters } from './MobileFilters';

interface MediaGalleryFiltersProps {
  items: MediaItem[];
  filterConfig: FilterConfig;
  filterState: FilterState;
  filtered: MediaItem[];
  /** Translator for the gallery's own namespace (Music / Movies / Books). */
  t: Translate;
  /** Translator for the shared `Gallery` namespace. */
  tGallery: Translate;
}

export function MediaGalleryFilters({
  items,
  filterConfig,
  filterState,
  filtered,
  t,
  tGallery,
}: MediaGalleryFiltersProps) {
  // The option lists depend only on the full item set, never on the current
  // selection, so they should not be rebuilt when a filter changes — let alone
  // on the scroll-driven re-renders that reach this component from the gallery.
  const options = useMemo(
    () => ({
      allCategories: Array.from(new Set(items.flatMap((item) => item.categories))).sort(),
      allSubtitles: Array.from(new Set(items.map((item) => item.subtitle))).sort(),
      allYears: Array.from(new Set(items.map((item) => item.year))).sort((a, b) => b - a),
    }),
    [items]
  );

  const filterData = {
    ...options,
    hasActiveFilters:
      filterState.selectedCategory !== 'All' ||
      filterState.selectedSubtitle !== 'All' ||
      filterState.selectedYear !== 'All',
  };

  return (
    <>
      <DesktopFilters
        filterConfig={filterConfig}
        filterState={filterState}
        filterData={filterData}
        filtered={filtered}
        t={t}
        tGallery={tGallery}
      />
      <MobileFilters
        filterConfig={filterConfig}
        filterState={filterState}
        filterData={filterData}
        filtered={filtered}
        t={t}
        tGallery={tGallery}
      />
    </>
  );
}
