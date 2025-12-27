import Image from 'next/image';
import clsx from 'clsx';
import { MediaItem, FilterConfig } from './types';
import { getOptimizedImageUrl, getBlurPlaceholderUrl } from '@/src/utils/imageOptimization';

interface MediaCardProps {
  item: MediaItem;
  filterConfig: FilterConfig;
  t: (key: string) => string;
  priority?: boolean;
}

export default function MediaCard({ item, filterConfig, t, priority = false }: MediaCardProps) {

  // Get aspect ratio classes based on config
  const getAspectRatioClasses = () => {
    switch (filterConfig.aspectRatio) {
      case 'square':
        return 'aspect-square';
      case 'portrait':
        return 'aspect-[3/4]'; // Common movie poster/book ratio
      case 'auto':
        return 'aspect-auto'; // Let the image determine the aspect ratio
      default:
        return 'aspect-square';
    }
  };

  // Optimize the image URL with Cloudinary transformations
  // For fill images (grid items), specify a reasonable max width based on expected display size
  // For auto aspect ratio images, specify width to optimize file size
  const getOptimizedWidth = () => {
    if (filterConfig.aspectRatio === 'auto') {
      return 800; // Larger width for better quality on auto images
    }
    // For grid items, max width is ~33vw on desktop, so ~600px is reasonable
    // This optimizes file size while maintaining quality
    return 600;
  };

  const optimizedImageUrl = getOptimizedImageUrl(
    item.cover,
    getOptimizedWidth(),
    undefined // Never force height to maintain aspect ratio
  );

  // Generate blur placeholder
  const blurDataURL = getBlurPlaceholderUrl(item.cover);

  // Calculate responsive sizes based on aspect ratio
  const getSizes = () => {
    if (filterConfig.aspectRatio === 'auto') {
      return '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px';
    }
    return '(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw';
  };

  return (
    <div className="rounded-lg bg-white dark:bg-gray-800 shadow-md transition-all duration-500 overflow-hidden flex flex-col w-full h-full">
      <div className="p-4">
        <div
          className={clsx(
            'relative w-full overflow-hidden rounded-md',
            filterConfig.aspectRatio === 'auto' ? 'h-auto' : getAspectRatioClasses()
          )}
        >
          {filterConfig.aspectRatio === 'auto' ? (
            <Image
              src={optimizedImageUrl}
              alt={`${item.title} cover`}
              width={400}
              height={600}
              sizes={getSizes()}
              placeholder="blur"
              blurDataURL={blurDataURL}
              priority={priority}
              loading={priority ? undefined : 'lazy'}
              className="rounded-md w-full h-auto"
            />
          ) : (
            <Image
              src={optimizedImageUrl}
              alt={`${item.title} cover`}
              fill
              sizes={getSizes()}
              placeholder="blur"
              blurDataURL={blurDataURL}
              priority={priority}
              loading={priority ? undefined : 'lazy'}
              className="rounded-md object-cover"
            />
          )}
        </div>
      </div>

      <div className="p-4 pt-0 flex flex-col flex-1">
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-1 text-gray-900 dark:text-white">{item.title}</h3>
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
                alt={item.externalLink.label}
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
