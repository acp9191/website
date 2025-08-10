import { MediaItem, FilterConfig, FilterState } from './types';
import { DesktopFilters } from './DesktopFilters';
import { MobileFilters } from './MobileFilters';

interface MediaGalleryFiltersProps {
  items: MediaItem[];
  filterConfig: FilterConfig;
  filterState: FilterState;
  filtered: MediaItem[];
  t: (key: string) => string;
}

export function MediaGalleryFilters({
  items,
  filterConfig,
  filterState,
  filtered,
  t,
}: MediaGalleryFiltersProps) {
  const allCategories = Array.from(new Set(items.flatMap((item) => item.categories))).sort();
  const allSubtitles = Array.from(new Set(items.map((item) => item.subtitle))).sort();
  const allYears = Array.from(new Set(items.map((item) => item.year))).sort((a, b) => b - a);

  const filterData = {
    allCategories,
    allSubtitles,
    allYears,
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
      />
      <MobileFilters
        filterConfig={filterConfig}
        filterState={filterState}
        filterData={filterData}
        filtered={filtered}
        t={t}
      />
    </>
  );
}
