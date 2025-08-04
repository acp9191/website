// app/layout.tsx
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import '../globals.css';
import ClientLayout from '@/src/components/ClientLayout';
import { notFound } from 'next/navigation';
import { routing } from '@/src/i18n/routing';

export const metadata = {
  title: 'Avery Peterson',
  description: 'Personal website of Avery Peterson',
};

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return (
    <html suppressHydrationWarning lang={locale}>
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/favicons/apple-touch-icon.png"></link>
        <link rel="icon" type="image/png" sizes="32x32" href="/favicons/favicon-32x32.png"></link>
        <link rel="icon" type="image/png" sizes="16x16" href="/favicons/favicon-16x16.png"></link>
        <link rel="manifest" href="/favicons/site.webmanifest"></link>
      </head>
      <body>
        <NextIntlClientProvider>
          <ClientLayout>{children}</ClientLayout>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
