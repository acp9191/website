import { useState, useEffect, useRef } from 'react';
import clsx from 'clsx';
import { MediaItem, FilterConfig } from './types';
import MediaCard from './MediaCard';

interface MediaGalleryGridProps {
  items: MediaItem[];
  filterConfig: FilterConfig;
  onImageClick: (cover: string) => void;
  t: (key: string) => string;
}

export function MediaGalleryGrid({ items, filterConfig, onImageClick, t }: MediaGalleryGridProps) {
  const [visibleItems, setVisibleItems] = useState<Set<string>>(new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Set up Intersection Observer for grid items
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

  // Reset visibility when items change (filters)
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
  }, [items]);

  // Observe elements when they mount
  const setElementRef = (element: HTMLDivElement | null, itemId: string) => {
    if (element && observerRef.current) {
      element.setAttribute('data-item-id', itemId);
      observerRef.current.observe(element);
    }
  };

  return (
    <div className="flex-1 min-w-0">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 grid-rows-auto">
        {items.map((item, i) => {
          const itemId = `${item.title}-${item.subtitle}`.replace(/\s+/g, '-').toLowerCase();

          return (
            <div
              key={itemId}
              ref={(el) => setElementRef(el, itemId)}
              className={clsx('transition-all duration-500 flex', {
                'opacity-100 translate-y-0': visibleItems.has(itemId),
                'opacity-0 translate-y-4': !visibleItems.has(itemId),
              })}
              style={{ transitionDelay: `${(i % 3) * 50}ms` }}
            >
              <MediaCard
                item={item}
                filterConfig={filterConfig}
                onImageClick={onImageClick}
                t={t}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
