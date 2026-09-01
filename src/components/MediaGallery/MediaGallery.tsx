'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { MediaItem, FilterConfig } from './types';
import { MediaGalleryHeader } from './MediaGalleryHeader';
import { MediaGalleryFilters } from './MediaGalleryFilters';
import { MediaGalleryGrid } from './MediaGalleryGrid';
import { ScrollToTopButton } from './ScrollToTopButton';
import { useMediaGalleryFilters } from './hooks/useMediaGalleryFilters';
import { useRevealOnScroll } from '@/src/hooks/useRevealOnScroll';

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
  // Labels shared by all three galleries live in their own namespace so they
  // are not repeated identically in Music, Movies and Books.
  const tGallery = useTranslations('Gallery');
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Custom hooks
  const filterState = useMediaGalleryFilters();
  const { visible: headerVisible, ref: headerRef } = useRevealOnScroll();

  // Memoised because this component also re-renders on scroll, when the
  // scroll-to-top button crosses its threshold, and that has nothing to do
  // with the filters.
  const filtered = useMemo(
    () =>
      items.filter((item) => {
        const categoryMatch =
          filterState.selectedCategory === 'All' ||
          item.categories.includes(filterState.selectedCategory);
        const subtitleMatch =
          filterState.selectedSubtitle === 'All' || item.subtitle === filterState.selectedSubtitle;
        const yearMatch =
          filterState.selectedYear === 'All' || item.year === filterState.selectedYear;
        return categoryMatch && subtitleMatch && yearMatch;
      }),
    [items, filterState.selectedCategory, filterState.selectedSubtitle, filterState.selectedYear]
  );

  // Scroll to top button visibility
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    // `behavior: 'smooth'` is a scripted scroll, so it ignores the
    // `prefers-reduced-motion` handling in globals.css and has to ask directly.
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    });
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="min-h-dvh">
        <MediaGalleryHeader
          ref={headerRef}
          visible={headerVisible}
          title={t('title')}
          subtitle={t('subtitle')}
        />

        {/*
          One grid for both breakpoints. MediaGalleryFilters renders the
          desktop sidebar and the mobile filter bar, each gated by its own
          breakpoint classes, so only the layout direction changes here:
          stacked (filters above grid) on mobile, sidebar beside grid on
          desktop.
        */}
        <div className="flex flex-col lg:flex-row lg:gap-8 pt-8">
          <MediaGalleryFilters
            items={items}
            filterConfig={filterConfig}
            filterState={filterState}
            filtered={filtered}
            t={t}
            tGallery={tGallery}
          />

          {/* Remounting on filter change resets the grid's reveal state without
              an effect that would cascade an extra render. */}
          <MediaGalleryGrid
            key={`${filterState.selectedCategory}|${filterState.selectedSubtitle}|${filterState.selectedYear}`}
            items={filtered}
            filterConfig={filterConfig}
          />
        </div>
      </div>

      <ScrollToTopButton
        show={showScrollTop}
        onClick={scrollToTop}
        label={tGallery('scrollToTop')}
      />
    </div>
  );
}
