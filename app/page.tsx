'use client';
import { useTranslations } from 'next-intl';

export default function Home() {
  const t = useTranslations('Home');
  return (
    <section className="space-y-6">
      <img
        src="https://res.cloudinary.com/acp/image/upload/v1754157313/acp_headshot_nhlged.jpg"
        alt="Avery Peterson headshot"
        className="mx-auto shadow-md rounded-xl w-auto h-100"
      />
      <h1 className="text-4xl font-bold text-center">{t('title')}</h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 text-center">{t('description')}</p>
    </section>
  );
}
