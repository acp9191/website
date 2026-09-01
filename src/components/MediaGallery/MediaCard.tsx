import Image from 'next/image';
import clsx from 'clsx';
import { MediaItem, FilterConfig } from './types';
import { getOptimizedImageUrl, BLUR_PLACEHOLDER } from '@/src/utils/imageOptimization';
import { Link } from '@/src/i18n/navigation';

interface MediaCardProps {
  item: MediaItem;
  filterConfig: FilterConfig;
  priority?: boolean;
}

/*
  Width of the source handed to Next's image optimizer — not what any browser
  downloads.

  A cover occupies at most a full phone screen (~430 CSS px) or a ~400px card
  on desktop, which is ~1290px of pixels on a 3x display. The previous 600px
  source silently capped album art below that: Next downscales from the source
  but never upscales past it, so every retina screen got a soft image. Oversized
  is cheap here — the extra bytes move Cloudinary to optimizer once, server
  side, and the result is cached for a year.
*/
const COVER_SOURCE_WIDTH = 1280;

export default function MediaCard({ item, filterConfig, priority = false }: MediaCardProps) {
  // Book and film art varies in proportion, so it is sized intrinsically;
  // album art is square and fills a ratio-locked box.
  const isAuto = filterConfig.aspectRatio === 'auto';
  const aspectClass = filterConfig.aspectRatio === 'portrait' ? 'aspect-[3/4]' : 'aspect-square';

  const optimizedImageUrl = getOptimizedImageUrl(
    item.cover,
    COVER_SOURCE_WIDTH,
    undefined // Never force height to maintain aspect ratio
  );

  /*
    What the slot actually measures, so the browser stops picking srcset
    candidates far larger than it can use.

    The grid is one column, then two at `sm`, then three at `lg`. From `lg` up
    those three columns share a `max-w-7xl` row with a fixed 288px sidebar, so
    the column stops growing at roughly 320px however wide the viewport gets.
  */
  const sizes = isAuto
    ? '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px'
    : '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 320px';

  return (
    <div className="rounded-lg bg-white dark:bg-gray-800 shadow-md transition-all duration-500 overflow-hidden flex flex-col w-full h-full">
      <div className="p-4">
        <div
          className={clsx(
            'relative w-full overflow-hidden rounded-md',
            isAuto ? 'h-auto' : aspectClass
          )}
        >
          {/*
            One <Image>, two layouts. Square covers fill a ratio-locked box;
            book and film art keeps its own proportions, so it is sized
            intrinsically instead. `loading` is not set: it already defaults to
            lazy whenever `priority` is false.
          */}
          <Image
            {...(isAuto ? { width: 400, height: 600 } : { fill: true })}
            src={optimizedImageUrl}
            alt={item.coverAlt}
            sizes={sizes}
            placeholder="blur"
            blurDataURL={BLUR_PLACEHOLDER}
            priority={priority}
            className={clsx('rounded-md', isAuto ? 'w-full h-auto' : 'object-cover')}
          />
        </div>
      </div>

      <div className="p-4 pt-0 flex flex-col flex-1">
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-1 text-gray-900 dark:text-white">
            <Link className="hover:underline" href={item.href}>
              {item.title}
            </Link>
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{item.subtitle}</p>
          <div className="mt-2 flex flex-wrap gap-1 text-xs">
            {item.categories.map((category) => (
              <span
                key={category}
                className="px-2 py-0.5 rounded-full bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-white"
              >
                {category}
              </span>
            ))}
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 line-clamp-4">
            {item.description}
          </p>
        </div>

        {item.externalLink && (
          <div className="mt-3 flex-shrink-0">
            <a
              href={item.externalLink.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-2 hover:underline text-sm transition-colors ${
                item.type === 'music'
                  ? 'text-green-600 hover:text-green-700'
                  : item.type === 'movie'
                    ? 'text-red-600 hover:text-red-700'
                    : 'text-blue-600 hover:text-blue-700'
              }`}
            >
              <Image
                src={item.externalLink.icon}
                // Decorative: the link text right next to it already says this.
                alt=""
                width={20}
                height={20}
                className="inline-block"
                loading="lazy"
              />
              {item.externalLink.label}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
