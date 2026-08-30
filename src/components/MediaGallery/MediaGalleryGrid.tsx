import { useState, useEffect, useRef, useCallback } from 'react';
import clsx from 'clsx';
import { MediaItem, FilterConfig } from './types';
import MediaCard from './MediaCard';

interface MediaGalleryGridProps {
  items: MediaItem[];
  filterConfig: FilterConfig;
}

export function MediaGalleryGrid({ items, filterConfig }: MediaGalleryGridProps) {
  const [visibleItems, setVisibleItems] = useState<Set<string>>(new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Created on first use rather than in an effect. Ref callbacks run during
  // commit, before effects, so an effect-created observer does not exist yet
  // when the cards try to register — they would never be observed and would sit
  // at opacity 0 forever. The old code hid this by re-querying the document on
  // a setTimeout; creating the observer lazily removes the need for that.
  const getObserver = useCallback(() => {
    if (!observerRef.current) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const itemId = entry.target.getAttribute('data-item-id');
              if (itemId) {
                setVisibleItems((prev) => (prev.has(itemId) ? prev : new Set(prev).add(itemId)));
              }
            }
          });
        },
        { threshold: 0, rootMargin: '100px' }
      );
    }
    return observerRef.current;
  }, []);

  useEffect(() => {
    return () => {
      observerRef.current?.disconnect();
      observerRef.current = null;
    };
  }, []);

  // Note: filtering resets this state by remounting the grid — MediaGallery
  // passes a `key` derived from the active filters. Clearing it from an effect
  // instead would cascade an extra render on every filter change.

  const setElementRef = useCallback(
    (element: HTMLDivElement | null, itemId: string) => {
      if (!element) return;
      element.setAttribute('data-item-id', itemId);
      getObserver().observe(element);
    },
    [getObserver]
  );

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
                priority={i < 6} // Priority loading for first 6 items (above the fold)
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
