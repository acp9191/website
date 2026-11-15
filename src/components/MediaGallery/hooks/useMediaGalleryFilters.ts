import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from '@/src/i18n/navigation';
import { FilterState } from '../types';
import { ALL, serializeFilterParams, type MediaFilterParams } from '@/src/lib/galleryFilters';

/**
 * Filter state, initialised from the URL and written back to it on every
 * change, so a filtered view is addressable and reproducible.
 *
 * `initial` comes from `searchParams` read server-side on first paint; the URL
 * already reflects it, so the effect skips that render and only starts
 * rewriting after the user picks something.
 */
export function useMediaGalleryFilters(
  initial: MediaFilterParams,
  subtitleParam: string
): FilterState {
  const router = useRouter();
  const pathname = usePathname();

  const [selectedCategory, setSelectedCategory] = useState(initial.genre ?? ALL);
  const [selectedSubtitle, setSelectedSubtitle] = useState(initial.subtitle ?? ALL);
  const [selectedYear, setSelectedYear] = useState<number | typeof ALL>(initial.year ?? ALL);

  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }

    const query = serializeFilterParams(
      {
        genre: selectedCategory === ALL ? undefined : selectedCategory,
        subtitle: selectedSubtitle === ALL ? undefined : selectedSubtitle,
        year: selectedYear === ALL ? undefined : selectedYear,
      },
      subtitleParam
    );
    router.replace(query ? `${pathname}?${query}` : pathname);
  }, [selectedCategory, selectedSubtitle, selectedYear, subtitleParam, pathname, router]);

  const resetFilters = () => {
    setSelectedCategory(ALL);
    setSelectedSubtitle(ALL);
    setSelectedYear(ALL);
  };

  return {
    selectedCategory,
    selectedSubtitle,
    selectedYear,
    setSelectedCategory,
    setSelectedSubtitle,
    setSelectedYear,
    resetFilters,
  };
}
