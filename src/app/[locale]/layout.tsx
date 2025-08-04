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
        <script
          // This script sets the initial theme based on user preference or saved setting
          // It runs before the React app hydrates to ensure the correct theme is applied immediately
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const savedTheme = localStorage.getItem('theme');
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                const isDark = savedTheme ? savedTheme === 'dark' : prefersDark;
                if (isDark) {
                  document.documentElement.classList.add('dark');
                }
              } catch (e) {}
            `,
          }}
        />
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
