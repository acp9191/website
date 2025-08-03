// app/sitemap.xml/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  const baseUrl = 'https://avery-peterson.com';

  const staticPaths = ['', '/about', '/favorites/music', '/favorites/movies']; // Add more as needed

  const urls = staticPaths
    .map(
      (path) => `
    <url>
      <loc>${baseUrl}${path}</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
    </url>`
    )
    .join('');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${urls}
  </urlset>`;

  return new NextResponse(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
