import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import { getOptimizedImageUrl, getBlurPlaceholderUrl } from '@/src/utils/imageOptimization';

export default async function Home() {
  const t = await getTranslations('Home');

  const title = t('title').replace(
    '👋',
    '<span class="inline-block animate-wave select-none">👋</span>'
  );

  return (
    <section className="space-y-6 px-4">
      <div
        className="mx-auto w-full max-w-xs sm:max-w-sm md:max-w-md animate-slide-up"
        style={{ animationDelay: '100ms' }}
      >
        <Image
          src={getOptimizedImageUrl('https://res.cloudinary.com/acp/image/upload/v1754157313/acp_headshot_nhlged.jpg')}
          alt="Avery Peterson headshot"
          width={400}
          height={400}
          className="rounded-xl shadow-md w-full h-auto"
          priority={true}
          placeholder="blur"
          blurDataURL={getBlurPlaceholderUrl('https://res.cloudinary.com/acp/image/upload/v1754157313/acp_headshot_nhlged.jpg')}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
        />
      </div>

      <h1
        className="text-4xl font-bold text-center animate-fade-up"
        style={{ animationDelay: '200ms' }}
        dangerouslySetInnerHTML={{ __html: title }}
      />

      <p
        className="text-lg text-gray-600 dark:text-gray-400 text-center animate-fade-up"
        style={{ animationDelay: '300ms' }}
      >
        {t('description')}
      </p>
    </section>
  );
}
