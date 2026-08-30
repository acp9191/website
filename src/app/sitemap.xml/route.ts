import { NextResponse } from 'next/server';
import { routing } from '@/src/i18n/routing';

const baseUrl = 'https://avery-peterson.com';

const staticPaths = ['', '/about', '/favorites/music', '/favorites/books', '/favorites/movies'];

/**
 * `localePrefix` is 'as-needed', so the default locale lives at unprefixed
 * paths — /about, not /en/about. Emitting the prefixed form for every locale
 * advertised a URL that 307s, which is exactly what a sitemap should not do.
 */
function localizedUrl(locale: string, path: string) {
  const prefix = locale === routing.defaultLocale ? '' : `/${locale}`;
  // The home page of the default locale is the bare origin.
  return `${baseUrl}${prefix}${path}` || baseUrl;
}

export async function GET() {
  // Content is static, so a single build-time timestamp is honest here: it is
  // the last moment the pages could have changed.
  const lastmod = new Date().toISOString();

  const urls = staticPaths
    .flatMap((path) =>
      routing.locales.map(
        (locale) => `
    <url>
      <loc>${localizedUrl(locale, path)}</loc>
      <lastmod>${lastmod}</lastmod>
      ${routing.locales
        .map(
          (altLocale) =>
            `<xhtml:link rel="alternate" hreflang="${altLocale}" href="${localizedUrl(altLocale, path)}"/>`
        )
        .join('\n      ')}
      <xhtml:link rel="alternate" hreflang="x-default" href="${localizedUrl(routing.defaultLocale, path)}"/>
    </url>`
      )
    )
    .join('');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
          xmlns:xhtml="http://www.w3.org/1999/xhtml">
    ${urls}
  </urlset>`;

  return new NextResponse(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
