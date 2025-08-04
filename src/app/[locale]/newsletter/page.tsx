// app/newsletter/page.tsx
'use client';
import { useTranslations } from 'next-intl';

export default function Newsletter() {
  const t = useTranslations('Newsletter');
  return (
    <section>
      <h2 className="text-2xl font-bold mb-2">{t('title')}</h2>
      <p className="mb-4">{t('description')}</p>
      <iframe
        src="https://buttondown.email/avery/embed"
        className="w-full h-64 border rounded-sm"
        title="Newsletter Signup"
      />
    </section>
  );
}
