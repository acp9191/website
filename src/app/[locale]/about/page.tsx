import type { Metadata } from 'next';
import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { buildMetadata } from '@/src/lib/metadata';
import {
  getOptimizedImageUrl,
  BLUR_PLACEHOLDER,
  HEADSHOT_URL,
} from '@/src/utils/imageOptimization';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildMetadata({ locale, path: '/about', titleKey: 'about' });
}

const PARAGRAPHS = ['description1', 'description2', 'description3'] as const;

/*
  Animated in CSS, the same way as the home page, rather than revealed by an
  IntersectionObserver.

  The observer version made this a client component and held the whole section
  — the `priority` headshot included — at opacity 0 until JavaScript had loaded,
  hydrated and fired the observer. That headshot is the page's LCP element, so
  the largest paint waited on the bundle. `animate-slide-up` moves it without
  touching opacity, so it is painted with the first frame; only the text fades.
*/
export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('About');

  return (
    <section className="space-y-6 px-4">
      <div
        className="mx-auto w-full max-w-xs sm:max-w-sm md:max-w-md animate-slide-up"
        style={{ animationDelay: '100ms' }}
      >
        <Image
          src={getOptimizedImageUrl(HEADSHOT_URL)}
          alt={t('imageAlt')}
          width={400}
          height={400}
          className="rounded-xl shadow-md w-full h-auto"
          priority={true}
          placeholder="blur"
          blurDataURL={BLUR_PLACEHOLDER}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
        />
      </div>

      <h1
        className="text-4xl font-bold text-center animate-fade-up"
        style={{ animationDelay: '200ms' }}
      >
        {t('title')}
      </h1>

      {PARAGRAPHS.map((key, index) => (
        <p
          key={key}
          className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed text-center animate-fade-up"
          style={{ animationDelay: `${300 + index * 100}ms` }}
        >
          {t(key)}
        </p>
      ))}
    </section>
  );
}
