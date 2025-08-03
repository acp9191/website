// components/ClientLayout.tsx
'use client';

import { useEffect, useState } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import Header from './Header';
import Footer from './Footer';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState('en');
  const [messages, setMessages] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem('locale');
    const preferred = stored || navigator.language.split('-')[0] || 'en';
    setLocale(preferred);
    import(`../messages/${preferred}.json`).then(setMessages);
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = savedTheme ? savedTheme === 'dark' : prefersDark;
    document.documentElement.classList.toggle('dark', isDark);
  }, []);

  if (!messages) return null;

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
        <Header locale={locale} />
        <main className="flex-1 max-w-3xl mx-auto px-4 py-8 w-full">{children}</main>
        <footer className="py-3">
          <Footer />
        </footer>
      </div>
    </NextIntlClientProvider>
  );
}
