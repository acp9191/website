import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { routing } from '@/src/i18n/routing';
import { SITE_URL, localePath, alternatesFor } from '@/src/lib/metadata';
import sitemap from '@/src/app/sitemap';
import robots from '@/src/app/robots';
import manifest from '@/src/app/manifest';

describe('SITE_URL', () => {
  it('is an absolute https origin with no trailing slash and no path', () => {
    expect(SITE_URL).toMatch(/^https:\/\//);
    expect(SITE_URL).not.toMatch(/\/$/);
    expect(new URL(SITE_URL).pathname).toBe('/');
  });
});

/*
  `localePrefix` is 'as-needed': the default locale is served unprefixed. Getting
  this wrong is not a visible error, it just means every URL the site publishes
  about itself points at something that 307s.
*/
describe('localePath', () => {
  it('leaves the default locale unprefixed', () => {
    expect(localePath(routing.defaultLocale, '/about')).toBe('/about');
  });

  it.each(routing.locales.filter((l) => l !== routing.defaultLocale))('prefixes %s', (locale) => {
    expect(localePath(locale, '/about')).toBe(`/${locale}/about`);
  });

  it('renders the default-locale home as "/" rather than an empty string', () => {
    expect(localePath(routing.defaultLocale, '')).toBe('/');
  });

  it('renders a non-default home as the bare prefix', () => {
    expect(localePath('es', '')).toBe('/es');
  });
});

describe('alternatesFor', () => {
  const alternates = alternatesFor('es', '/favorites/music');

  it('canonicalises to this locale and path', () => {
    expect(alternates?.canonical).toBe('/es/favorites/music');
  });

  it('lists every locale plus x-default', () => {
    expect(Object.keys(alternates?.languages ?? {}).sort()).toEqual(
      [...routing.locales, 'x-default'].sort()
    );
  });

  it('points x-default at the default locale', () => {
    expect(alternates?.languages?.['x-default']).toBe(
      localePath(routing.defaultLocale, '/favorites/music')
    );
  });
});

describe('sitemap', () => {
  const entries = sitemap();

  it('covers every path in every locale', () => {
    expect(entries).toHaveLength(5 * routing.locales.length);
  });

  it('emits absolute URLs on SITE_URL only', () => {
    for (const { url } of entries) expect(url.startsWith(SITE_URL)).toBe(true);
  });

  /*
    The default-locale home must be the bare origin, matching how Next resolves
    a canonical of '/' against metadataBase. Advertising it with a trailing
    slash is the same class of mistake as advertising a URL that redirects.
  */
  it('has no trailing slashes and no doubled separators', () => {
    for (const { url } of entries) {
      expect(url, url).not.toMatch(/\/$/);
      expect(url.replace(SITE_URL, ''), url).not.toMatch(/\/\//);
    }
  });

  it('gives every entry a complete hreflang set', () => {
    for (const entry of entries) {
      expect(Object.keys(entry.alternates?.languages ?? {}).sort()).toEqual(
        [...routing.locales, 'x-default'].sort()
      );
    }
  });

  it('lists no URL twice', () => {
    const urls = entries.map((e) => e.url);
    expect(new Set(urls).size).toBe(urls.length);
  });
});

describe('robots', () => {
  it('points at the sitemap on the same origin as the pages', () => {
    expect(robots().sitemap).toBe(`${SITE_URL}/sitemap.xml`);
  });
});

describe('manifest', () => {
  const m = manifest();

  it('references icons that exist in public/', () => {
    for (const icon of m.icons ?? []) {
      const file = path.join(process.cwd(), 'public', icon.src!);
      expect(existsSync(file), `${icon.src} is referenced but missing`).toBe(true);
    }
  });

  it('references screenshots that exist in public/', () => {
    for (const shot of m.screenshots ?? []) {
      const file = path.join(process.cwd(), 'public', shot.src!);
      expect(existsSync(file), `${shot.src} is referenced but missing`).toBe(true);
    }
  });

  it('stays installable', () => {
    expect(m.name).toBeTruthy();
    expect(m.start_url).toBeTruthy();
    expect(m.display).toBe('standalone');
    expect(m.icons?.length).toBeGreaterThan(0);
  });
});
