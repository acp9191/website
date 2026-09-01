import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/src/lib/metadata';

/**
 * Replaces the static public/robots.txt, whose sitemap URL was a hard-coded
 * copy of the origin and could drift from it.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
