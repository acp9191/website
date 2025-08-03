'use client';
import { useTranslations } from 'next-intl';

export default function AboutPage() {
  const t = useTranslations('About');

  return (
    <section className="space-y-6 px-4">
      <img
        src="https://res.cloudinary.com/acp/image/upload/v1754157313/acp_headshot_nhlged.jpg"
        alt="Avery Peterson headshot"
        className="mx-auto shadow-md rounded-xl w-full max-w-xs sm:max-w-sm md:max-w-md"
      />
      <h1 className="text-4xl font-bold text-center">{t('title')}</h1>
      <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed text-center">
        I'm Avery Peterson — a software engineer based in NYC who cares about building thoughtful,
        well-crafted experiences.
      </p>
      <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed text-center">
        I enjoy clean code, great design, and making things that feel intentional.
      </p>
      <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed text-center">
        Outside of work, you'll usually find me listening to music, reading something new, or
        running through the city.
      </p>
    </section>
  );
}
