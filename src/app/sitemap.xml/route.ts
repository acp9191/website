import { NextResponse } from 'next/server';
import { routing } from '@/src/i18n/routing';
import { SITE_URL, localePath } from '@/src/lib/metadata';

const staticPaths = ['', '/about', '/favorites/music', '/favorites/books', '/favorites/movies'];

/**
 * Absolute URL for one page in one locale.
 *
 * `localePath` is the same helper the pages use to build their canonicals, so
 * the sitemap cannot drift from them. That matters here: `localePrefix` is
 * 'as-needed', and emitting the prefixed form for the default locale advertised
 * a URL that 307s — exactly what a sitemap should not do.
 */
const localizedUrl = (locale: string, path: string) => {
  const relative = localePath(locale, path);
  // Match how Next resolves each page's canonical against `metadataBase`: the
  // root is the bare origin, not a trailing slash. Advertising a URL here that
  // differs by a slash from the canonical the page declares is the same class
  // of mistake as advertising one that redirects.
  return relative === '/' ? SITE_URL : `${SITE_URL}${relative}`;
};

export async function GET() {
  // This route prerenders, so the timestamp is fixed at build time. Since the
  // content is static markdown compiled into the build, that is honest: it is
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
