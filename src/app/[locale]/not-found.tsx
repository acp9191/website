import { useTranslations } from 'next-intl';
import { Link } from '@/src/i18n/navigation';

export default function NotFound() {
  const t = useTranslations('NotFound');

  return (
    <section className="px-4 py-16 text-center space-y-4">
      <p className="text-6xl font-bold text-gray-300 dark:text-gray-700">404</p>
      <h1 className="text-2xl font-bold">{t('title')}</h1>
      <p className="text-gray-600 dark:text-gray-400">{t('description')}</p>
      <Link
        href="/"
        className="inline-block mt-4 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
      >
        {t('backHome')}
      </Link>
    </section>
  );
}
