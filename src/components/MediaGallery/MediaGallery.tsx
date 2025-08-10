'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { MediaItem, FilterConfig } from './types';
import { MediaGalleryHeader } from './MediaGalleryHeader';
import { MediaGalleryFilters } from './MediaGalleryFilters';
import { MediaGalleryGrid } from './MediaGalleryGrid';
import { ScrollToTopButton } from './ScrollToTopButton';
import { ImageModal } from './ImageModal';
import { useMediaGalleryFilters } from './hooks/useMediaGalleryFilters';
import { useIntersectionObserver } from './hooks/useIntersectionObserver';
import { useModal } from './hooks/useModal';

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
  const [showScrollTop, setShowScrollTop] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Custom hooks
  const filterState = useMediaGalleryFilters();
  const { headerVisible, headerRef } = useIntersectionObserver();
  const { modalImage, showModal, modalAnimation, openModal, closeModal } = useModal();

  const filtered = items.filter((item) => {
    const categoryMatch =
      filterState.selectedCategory === 'All' ||
      item.categories.includes(filterState.selectedCategory);
    const subtitleMatch =
      filterState.selectedSubtitle === 'All' || item.subtitle === filterState.selectedSubtitle;
    const yearMatch = filterState.selectedYear === 'All' || item.year === filterState.selectedYear;
    return categoryMatch && subtitleMatch && yearMatch;
  });

  // Scroll to top button visibility
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // Prevent upward scrolling beyond the top of the container
  useEffect(() => {
    const preventUpwardScroll = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        // If the container's top is above the viewport, scroll to bring it back
        if (rect.top > 0) {
          window.scrollTo({
            top: window.scrollY - rect.top,
            behavior: 'auto',
          });
        }
      }
    };

    // Check on mount and after animations
    const timeouts = [0, 100, 300, 500, 1000].map((delay) =>
      setTimeout(preventUpwardScroll, delay)
    );

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, []);

  return (
    <div ref={containerRef} className="max-w-7xl mx-auto">
      <div style={{ minHeight: '100vh' }}>
        <MediaGalleryHeader
          ref={headerRef}
          visible={headerVisible}
          title={t('title')}
          subtitle={t('subtitle')}
        />

        {/* Desktop Layout */}
        <div className="hidden lg:flex gap-8 pt-8">
          <MediaGalleryFilters
            items={items}
            filterConfig={filterConfig}
            filterState={filterState}
            filtered={filtered}
            t={t}
          />

          <MediaGalleryGrid
            items={filtered}
            filterConfig={filterConfig}
            onImageClick={openModal}
            t={t}
          />
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden pt-8">
          <MediaGalleryFilters
            items={items}
            filterConfig={filterConfig}
            filterState={filterState}
            filtered={filtered}
            t={t}
          />

          <MediaGalleryGrid
            items={filtered}
            filterConfig={filterConfig}
            onImageClick={openModal}
            t={t}
          />
        </div>
      </div>

      <ScrollToTopButton show={showScrollTop} onClick={scrollToTop} />

      <ImageModal
        image={modalImage}
        show={showModal}
        animation={modalAnimation}
        onClose={closeModal}
      />
    </div>
  );
}
