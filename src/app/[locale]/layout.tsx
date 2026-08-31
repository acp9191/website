// app/layout.tsx
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { Inter } from 'next/font/google';
import '../globals.css';
import ClientLayout from '@/src/components/ClientLayout';
import { notFound } from 'next/navigation';
import { routing } from '@/src/i18n/routing';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import type { Metadata } from 'next';
import { SITE_NAME, SITE_URL, buildMetadata } from '@/src/lib/metadata';
import { THEME_INIT_SCRIPT } from '@/src/lib/theme';
import ThemeSync from '@/src/components/ThemeSync';

// Font optimization with next/font
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

/**
 * Site-wide defaults. Per-page titles, descriptions, canonicals and hreflang
 * sets come from each page's own generateMetadata; `title.template` frames
 * whatever they supply.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: SITE_NAME,
      template: `%s | ${SITE_NAME}`,
    },
    ...(await buildMetadata({ locale, path: '' })),
  };
}

// Prerender every locale at build time instead of rendering on demand
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

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

  // Without this, next-intl resolves the locale from request headers, which
  // opts the whole subtree into dynamic rendering.
  setRequestLocale(locale);

  return (
    <html suppressHydrationWarning lang={locale} className={inter.variable}>
      <head>
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
        {/*
          Must stay a raw <script> here in <head>, ahead of the stylesheet, or
          the browser paints a light background before the theme is resolved.

          It only covers the first paint of a document. Switching locale remounts
          this layout without a new document, and React rebuilds <html> from its
          own props, dropping what this wrote — ThemeSync in <body> puts it back.
        */}
        <script
          // Sets the initial theme from the stored preference before the React
          // app hydrates, so the correct colours are painted on the first frame.
          dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }}
        />
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
        {/*
          Restores the theme after React remounts this layout — which switching
          locale does, because `[locale]` sits above it. See ThemeSync.
        */}
        <ThemeSync />
        <NextIntlClientProvider>
          <ClientLayout>{children}</ClientLayout>
        </NextIntlClientProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
