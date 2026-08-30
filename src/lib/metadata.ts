import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { routing } from '@/src/i18n/routing';

export const SITE_URL = 'https://avery-peterson.com';
export const SITE_NAME = 'Avery Peterson';

/** OpenGraph wants a full locale tag, not the bare language code. */
const OG_LOCALES: Record<string, string> = {
  en: 'en_US',
  es: 'es_ES',
  fr: 'fr_FR',
  it: 'it_IT',
  de: 'de_DE',
};

/**
 * `localePrefix` is 'as-needed', so the default locale is served unprefixed.
 * The home page of the default locale is the bare origin path.
 */
export function localePath(locale: string, path: string): string {
  const prefix = locale === routing.defaultLocale ? '' : `/${locale}`;
  return `${prefix}${path}` || '/';
}

/**
 * Canonical and hreflang set for one page in one locale.
 *
 * These have to be computed per page. Declaring them once on the layout made
 * every route claim `canonical: '/'` — telling search engines that /about and
 * /favorites/music were duplicates of the home page — and pointed every
 * hreflang alternate at a locale home page rather than the matching page.
 */
export function alternatesFor(locale: string, path: string): Metadata['alternates'] {
  return {
    canonical: localePath(locale, path),
    languages: {
      ...Object.fromEntries(routing.locales.map((l) => [l, localePath(l, path)])),
      'x-default': localePath(routing.defaultLocale, path),
    },
  };
}

/**
 * Builds the metadata for a page: localized title and description, a canonical
 * and hreflang set for this exact path, and OpenGraph/Twitter cards to match.
 *
 * `title` is omitted for the home page so the layout's default (the site name)
 * applies; every other page flows through the layout's `title.template`.
 */
export async function buildMetadata({
  locale,
  path,
  titleKey,
}: {
  locale: string;
  path: string;
  titleKey?: 'about' | 'music' | 'books' | 'movies';
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'Meta' });

  const title = titleKey ? t(titleKey) : SITE_NAME;
  const description = t('description');
  const url = `${SITE_URL}${localePath(locale, path)}`;

  return {
    ...(titleKey ? { title } : {}),
    description,
    alternates: alternatesFor(locale, path),
    openGraph: {
      title: titleKey ? `${title} | ${SITE_NAME}` : SITE_NAME,
      description,
      url,
      siteName: SITE_NAME,
      images: [
        {
          url: `${SITE_URL}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: SITE_NAME,
        },
      ],
      locale: OG_LOCALES[locale] ?? OG_LOCALES[routing.defaultLocale],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: titleKey ? `${title} | ${SITE_NAME}` : SITE_NAME,
      description,
      creator: '@acp9191',
      images: [`${SITE_URL}/og-image.jpg`],
    },
  };
}
