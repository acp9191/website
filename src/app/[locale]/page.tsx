'use client';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

export default function Home() {
  const t = useTranslations('Home');

  // Parse the title to find and replace the wave emoji with animated version
  const animatedTitle = () => {
    const title = t('title');
    // Replace the wave emoji with animated version
    return title.replace('👋', '<span class="inline-block animate-wave select-none">👋</span>');
  };

  return (
    <section className="space-y-6 px-4">
      <div className="mx-auto w-full max-w-xs sm:max-w-sm md:max-w-md">
        <Image
          src="https://res.cloudinary.com/acp/image/upload/v1754157313/acp_headshot_nhlged.jpg"
          alt="Avery Peterson headshot"
          width={400}
          height={400}
          className="rounded-xl shadow-md w-full h-auto"
          priority={true}
        />
      </div>
      <h1
        className="text-4xl font-bold text-center"
        dangerouslySetInnerHTML={{ __html: animatedTitle() }}
      />
      <p className="text-lg text-gray-600 dark:text-gray-400 text-center">{t('description')}</p>
    </section>
  );
}
