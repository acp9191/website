import type { MetadataRoute } from 'next';
import { routing } from '@/src/i18n/routing';
import { SITE_URL, localePath } from '@/src/lib/metadata';
import { loadContent } from '@/src/lib/content';
import { MEDIA_CONFIG, MEDIA_SECTIONS, mediaItemPath } from '@/src/lib/media';

const staticPaths = ['', '/about', '/favorites/music', '/favorites/books', '/favorites/movies'];

/**
 * Absolute URL for one page in one locale.
 *
 * `localePath` is the same helper the pages use to build their canonicals, so
 * the sitemap cannot drift from them — `localePrefix` is 'as-needed', and
 * emitting the prefixed form for the default locale advertised a URL that 307s.
 * Next resolves a page canonical of '/' against `metadataBase` as the bare
 * origin, so the root is spelled the same way here.
 */
function localizedUrl(locale: string, path: string): string {
  const relative = localePath(locale, path);
  return relative === '/' ? SITE_URL : `${SITE_URL}${relative}`;
}

/**
 * Replaces a route handler that built the XML by hand, including the
 * `xhtml:link` alternates. Next emits the same document — the hreflang set
 * included — from this data, so the escaping and namespace declarations are no
 * longer this file's problem.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // The content is markdown compiled into the build, so a build-time timestamp
  // is honest: it is the last moment these pages could have changed.
  const lastModified = new Date();

  const itemPaths = (
    await Promise.all(
      MEDIA_SECTIONS.map(async (section) => {
        const entries = await loadContent(MEDIA_CONFIG[section].contentCollection);
        return entries.map((entry) => mediaItemPath(section, entry.slug));
      })
    )
  ).flat();

  return [...staticPaths, ...itemPaths].flatMap((path) =>
    routing.locales.map((locale) => ({
      url: localizedUrl(locale, path),
      lastModified,
      alternates: {
        languages: {
          ...Object.fromEntries(routing.locales.map((l) => [l, localizedUrl(l, path)])),
          'x-default': localizedUrl(routing.defaultLocale, path),
        },
      },
    }))
  );
}
