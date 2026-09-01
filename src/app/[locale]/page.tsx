import { getTranslations, setRequestLocale } from 'next-intl/server';
import Image from 'next/image';
import {
  getOptimizedImageUrl,
  BLUR_PLACEHOLDER,
  HEADSHOT_URL,
} from '@/src/utils/imageOptimization';

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('Home');

  return (
    <section className="space-y-6 px-4">
      <div
        className="mx-auto w-full max-w-xs sm:max-w-sm md:max-w-md animate-slide-up"
        style={{ animationDelay: '100ms' }}
      >
        <Image
          src={getOptimizedImageUrl(HEADSHOT_URL)}
          alt="Avery Peterson headshot"
          width={400}
          height={400}
          className="rounded-xl shadow-md w-full h-auto"
          priority={true}
          placeholder="blur"
          blurDataURL={BLUR_PLACEHOLDER}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
        />
      </div>

      {/*
        The waving hand is marked up in the message itself rather than spliced
        into it here. String-replacing the emoji meant piping a translated
        string through dangerouslySetInnerHTML, and it broke silently the
        moment a translation rendered the greeting without that exact emoji.
      */}
      <h1
        className="text-4xl font-bold text-center animate-fade-up"
        style={{ animationDelay: '200ms' }}
      >
        {t.rich('title', {
          wave: (chunks) => <span className="inline-block animate-wave select-none">{chunks}</span>,
        })}
      </h1>

      <p
        className="text-lg text-gray-600 dark:text-gray-400 text-center animate-fade-up"
        style={{ animationDelay: '300ms' }}
      >
        {t('description')}
      </p>
    </section>
  );
}
