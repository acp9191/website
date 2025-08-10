import Image from 'next/image';
import clsx from 'clsx';
import { MediaItem, FilterConfig } from './types';

interface MediaCardProps {
  item: MediaItem;
  filterConfig: FilterConfig;
  onImageClick: (cover: string) => void;
  t: (key: string) => string;
}

export default function MediaCard({ item, filterConfig, onImageClick, t }: MediaCardProps) {
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

  return (
    <div className="rounded-lg bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-all duration-500 overflow-hidden flex flex-col w-full h-full">
      <div className="p-4">
        <div
          className={clsx(
            'relative w-full overflow-hidden rounded-md cursor-pointer',
            filterConfig.aspectRatio === 'auto' ? 'h-auto' : getAspectRatioClasses()
          )}
          onClick={() => onImageClick(item.cover)}
        >
          <Image
            src={item.cover}
            alt={`${item.title} cover`}
            width={filterConfig.aspectRatio === 'auto' ? 400 : undefined}
            height={filterConfig.aspectRatio === 'auto' ? 600 : undefined}
            fill={filterConfig.aspectRatio !== 'auto'}
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
            className={clsx(
              'rounded-md hover:scale-105 transition-transform duration-300',
              filterConfig.aspectRatio === 'auto' ? 'w-full h-auto' : 'object-cover'
            )}
          />
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
              />
              {item.externalLink.label}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
