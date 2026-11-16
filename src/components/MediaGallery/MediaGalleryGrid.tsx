import { MediaItem, FilterConfig } from './types';
import MediaCard from './MediaCard';

interface MediaGalleryGridProps {
  items: MediaItem[];
  filterConfig: FilterConfig;
}

/** The first two rows on desktop: the cards in view on load. */
const ABOVE_THE_FOLD = 6;

/*
  All reveals are CSS, not an IntersectionObserver. The observer held every
  card at opacity 0 until hydration, including the priority covers that are the
  page's LCP, and showed nothing at all without JavaScript.

  The first rows fade in on a timer from the first paint, staggered across the
  three columns. Later cards use the `.reveal-on-scroll` view timeline in
  globals.css; it cannot do the first rows, since a card already in view on
  load sits at the end of its range and never visibly animates.

  MediaGallery remounts this grid when the filters change, which restarts the
  animations so the filtered results fade in too.
*/
export function MediaGalleryGrid({ items, filterConfig }: MediaGalleryGridProps) {
  return (
    <div className="flex-1 min-w-0">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 grid-rows-auto">
        {items.map((item, i) => {
          const aboveTheFold = i < ABOVE_THE_FOLD;
          return (
            // `href` carries the slug, which is unique within a collection;
            // title and creator are not guaranteed to be.
            <div
              key={item.href}
              className={`flex ${aboveTheFold ? 'animate-fade-up' : 'reveal-on-scroll'}`}
              style={aboveTheFold ? { animationDelay: `${(i % 3) * 50}ms` } : undefined}
            >
              <MediaCard item={item} filterConfig={filterConfig} priority={aboveTheFold} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
