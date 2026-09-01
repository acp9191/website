import Image from 'next/image';
import { Link } from '@/src/i18n/navigation';
import type { ContentEntry } from '@/src/lib/content';
import type { MediaSection } from '@/src/lib/media';
import { creatorFor, externalUrlFor, imageFor, MEDIA_CONFIG } from '@/src/lib/media';
import { BLUR_PLACEHOLDER, getOptimizedImageUrl } from '@/src/utils/imageOptimization';

type MediaDetailProps = {
  entry: ContentEntry;
  section: MediaSection;
  locale: string;
  labels: {
    collection: string;
    creator: string;
    year: string;
    genres: string;
    external?: string;
  };
};

export default function MediaDetail({ entry, section, locale, labels }: MediaDetailProps) {
  const config = MEDIA_CONFIG[section];
  const image = imageFor(section, entry);
  const externalUrl = externalUrlFor(section, entry);
  const isAlbum = section === 'music';

  return (
    <article className="mx-auto max-w-4xl px-4">
      <Link
        href={config.path}
        className="mb-6 inline-block text-sm text-gray-600 underline hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
      >
        {labels.collection}
      </Link>

      <div className="grid items-start gap-8 md:grid-cols-[minmax(0,320px)_1fr]">
        <Image
          src={getOptimizedImageUrl(image, 960)}
          alt={entry.title}
          width={isAlbum ? 600 : 400}
          height={600}
          sizes="(max-width: 768px) 100vw, 320px"
          placeholder="blur"
          blurDataURL={BLUR_PLACEHOLDER}
          className="h-auto w-full rounded-xl shadow-md"
          priority
        />

        <div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
            {entry.title}
          </h1>
          <dl className="mt-5 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
            <dt className="font-semibold text-gray-900 dark:text-white">{labels.creator}</dt>
            <dd className="text-gray-600 dark:text-gray-300">{creatorFor(section, entry)}</dd>
            <dt className="font-semibold text-gray-900 dark:text-white">{labels.year}</dt>
            <dd className="text-gray-600 dark:text-gray-300">{entry.year}</dd>
          </dl>

          <ul className="mt-5 flex flex-wrap gap-2" aria-label={labels.genres}>
            {(entry.genres ?? []).map((genre) => (
              <li
                key={genre}
                className="rounded-full bg-gray-200 px-3 py-1 text-xs text-gray-800 dark:bg-gray-700 dark:text-white"
              >
                {genre}
              </li>
            ))}
          </ul>

          <p
            className="mt-6 leading-7 text-gray-700 dark:text-gray-300"
            lang={locale === 'en' ? undefined : 'en'}
          >
            {entry.description}
          </p>

          {externalUrl && labels.external && (
            <a
              href={externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex font-medium underline"
            >
              {labels.external}
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
