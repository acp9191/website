import { MediaItem, FilterConfig } from './types';
import MediaCard from './MediaCard';

interface MediaGalleryGridProps {
  items: MediaItem[];
  filterConfig: FilterConfig;
}

/*
  Cards reveal through the `.reveal-on-scroll` view timeline in globals.css,
  not an IntersectionObserver. The observer held every card at opacity 0 until
  hydration, including the priority covers that are the page's LCP, and showed
  nothing at all without JavaScript.
*/
export function MediaGalleryGrid({ items, filterConfig }: MediaGalleryGridProps) {
  return (
    <div className="flex-1 min-w-0">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 grid-rows-auto">
        {items.map((item, i) => (
          // `href` carries the slug, which is unique within a collection;
          // title and creator are not guaranteed to be.
          <div key={item.href} className="reveal-on-scroll flex">
            <MediaCard
              item={item}
              filterConfig={filterConfig}
              priority={i < 6} // Priority loading for first 6 items (above the fold)
            />
          </div>
        ))}
      </div>
    </div>
  );
}
