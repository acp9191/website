// app/layout.tsx
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { Inter } from 'next/font/google';
import '../globals.css';
import ClientLayout from '@/src/components/ClientLayout';
import { notFound } from 'next/navigation';
import { routing } from '@/src/i18n/routing';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { metadata as siteMetadata } from './metadata';

// Font optimization with next/font
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata = siteMetadata;

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
    <html suppressHydrationWarning lang={locale} className={inter.variable}>
      <head>
        <script
          // This script sets the initial theme based on user preference or saved setting
          // It runs before the React app hydrates to ensure the correct theme is applied immediately
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const savedTheme = localStorage.getItem('theme');
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                let isDark;

                if (savedTheme === 'dark') {
                  isDark = true;
                } else if (savedTheme === 'light') {
                  isDark = false;
                } else {
                  // 'system' or no saved theme - use system preference
                  isDark = prefersDark;
                }

                if (isDark) {
                  document.documentElement.classList.add('dark');
                }
              } catch (e) {}
            `,
          }}
        />
        {process.env.NODE_ENV === 'production' && (
          <script
            // Register service worker for PWA functionality (only in production)
            dangerouslySetInnerHTML={{
              __html: `
                if ('serviceWorker' in navigator) {
                  window.addEventListener('load', function() {
                    navigator.serviceWorker.register('/sw.js').then(
                      function(registration) {
                        console.log('ServiceWorker registration successful');
                      },
                      function(err) {
                        console.log('ServiceWorker registration failed: ', err);
                      }
                    );
                  });
                }
              `,
            }}
          />
        )}
        <link rel="apple-touch-icon" sizes="180x180" href="/favicons/apple-touch-icon.png"></link>
        <link rel="icon" type="image/png" sizes="32x32" href="/favicons/favicon-32x32.png"></link>
        <link rel="icon" type="image/png" sizes="16x16" href="/favicons/favicon-16x16.png"></link>
        <link rel="manifest" href="/manifest.json"></link>
        <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)"></meta>
        <meta name="theme-color" content="#000000" media="(prefers-color-scheme: dark)"></meta>
        <meta name="mobile-web-app-capable" content="yes"></meta>
        <meta name="apple-mobile-web-app-capable" content="yes"></meta>
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"></meta>
      </head>
      <body>
        <NextIntlClientProvider>
          <ClientLayout>{children}</ClientLayout>
        </NextIntlClientProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
