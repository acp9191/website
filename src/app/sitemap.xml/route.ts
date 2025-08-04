// filepath: /Users/averypeterson/Downloads/avery-site-complete/src/app/sitemap.xml/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  const baseUrl = 'https://avery-peterson.com';
  const locales = ['en', 'es', 'fr', 'it', 'de'];
  const staticPaths = ['', '/about', '/favorites/music', '/favorites/movies'];

  const urls = staticPaths
    .flatMap((path) =>
      locales.map(
        (locale) => `
    <url>
      <loc>${baseUrl}/${locale}${path}</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
      ${locales
        .map(
          (altLocale) =>
            `<xhtml:link rel="alternate" hreflang="${altLocale}" href="${baseUrl}/${altLocale}${path}"/>`
        )
        .join('\n      ')}
      <xhtml:link rel="alternate" hreflang="x-default" href="${baseUrl}/en${path}"/>
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
