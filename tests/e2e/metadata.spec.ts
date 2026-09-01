import { expect, request as apiRequest, test } from '@playwright/test';
import { SITE_URL } from '@/src/lib/metadata';
import { routing } from '@/src/i18n/routing';
import { loadContent } from '@/src/lib/content';

const PAGES = ['/', '/about', '/favorites/music', '/favorites/books', '/favorites/movies'];

/** The path a published URL points at, so it can be requested against the test server. */
const pathOf = (url: string) => new URL(url).pathname || '/';

/*
  Fetched the way a crawler would: from a context that has never been used, so
  it carries no NEXT_LOCALE cookie.

  The proxy redirects a visitor whose stored preference disagrees with the URL,
  which is right for people and wrong to measure here. A shared request context
  keeps cookies, so fetching /de set a preference that then redirected the next
  /about — making the site look broken when it was not.
*/
async function fetchFresh(path: string) {
  const context = await apiRequest.newContext({ baseURL: 'http://localhost:3000' });
  try {
    return { status: (await context.get(path, { maxRedirects: 0 })).status() };
  } finally {
    await context.dispose();
  }
}

/*
  A canonical or hreflang naming a URL that 307s is the failure this area keeps
  producing: first by prefixing the default locale, which `localePrefix:
  'as-needed'` does not serve, and later by naming the apex while the site is
  served from www.
*/
for (const path of PAGES) {
  test(`${path} publishes URLs that resolve without a redirect`, async ({ page }) => {
    await page.goto(path);

    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
    expect(canonical, 'a canonical must be declared').toBeTruthy();
    expect(canonical!.startsWith(SITE_URL), `${canonical} should sit on SITE_URL`).toBe(true);
    expect(pathOf(canonical!)).toBe(path);

    const alternates = await page.locator('link[rel="alternate"][hreflang]').all();
    const langs = await Promise.all(alternates.map((l) => l.getAttribute('hreflang')));
    expect(langs.sort()).toEqual([...routing.locales, 'x-default'].sort());

    // Every advertised URL, fetched against this server by path. A redirect
    // here means the site is telling crawlers about an address it does not serve.
    for (const link of alternates) {
      const href = (await link.getAttribute('href'))!;
      expect(href.startsWith(SITE_URL), `${href} should sit on SITE_URL`).toBe(true);

      expect((await fetchFresh(pathOf(href))).status, `${href} should resolve directly`).toBe(200);
    }
  });
}

test('every sitemap URL resolves without a redirect', async ({ request }) => {
  test.setTimeout(60_000);
  const xml = await (await request.get('/sitemap.xml')).text();
  const locs = Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/g), (m) => m[1]);
  const mediaCount = (
    await Promise.all([loadContent('albums'), loadContent('books'), loadContent('movies')])
  ).reduce((total, collection) => total + collection.length, 0);

  expect(locs.length).toBe((PAGES.length + mediaCount) * routing.locales.length);

  const pathsByLocale = Object.fromEntries(
    routing.locales.map((locale) => [locale, [] as string[]])
  );
  for (const loc of locs) {
    expect(loc.startsWith(SITE_URL), `${loc} should sit on SITE_URL`).toBe(true);
    const path = pathOf(loc);
    const locale = routing.locales.find(
      (candidate) =>
        candidate !== routing.defaultLocale &&
        (path === `/${candidate}` || path.startsWith(`/${candidate}/`))
    );
    pathsByLocale[locale ?? routing.defaultLocale].push(path);
  }

  // One cookie jar per locale is enough isolation: every URL in a group agrees
  // with the NEXT_LOCALE preference set by the first request in that group.
  await Promise.all(
    Object.values(pathsByLocale).map(async (paths) => {
      const context = await apiRequest.newContext({ baseURL: 'http://localhost:3000' });
      try {
        for (const path of paths) {
          expect(
            (await context.get(path, { maxRedirects: 0 })).status(),
            `${path} should resolve directly`
          ).toBe(200);
        }
      } finally {
        await context.dispose();
      }
    })
  );
});

test('robots points at the sitemap on the same origin the pages claim', async ({ request }) => {
  const body = await (await request.get('/robots.txt')).text();
  expect(body).toContain(`Sitemap: ${SITE_URL}/sitemap.xml`);
});

test('a localized detail page aligns its canonical and JSON-LD identity', async ({ page }) => {
  const path = '/es/favorites/music/swimming';
  const url = `${SITE_URL}${path}`;
  await page.goto(path);

  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', url);
  const scripts = await page.locator('script[type="application/ld+json"]').allTextContents();
  const data = scripts
    .map((script) => JSON.parse(script))
    .find((value) => value['@type'] === 'MusicAlbum');
  expect(data).toMatchObject({
    '@type': 'MusicAlbum',
    '@id': `${url}#item`,
    url,
    inLanguage: 'en',
  });
  await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute(
    'href',
    `${SITE_URL}/favorites/music/swimming`
  );
});

test('the versioned content API returns normalized records and JSON errors', async ({
  request,
}) => {
  const response = await request.get('/api/v1/content/music');
  expect(response.status()).toBe(200);
  expect(response.headers()['cache-control']).toContain('s-maxage=86400');
  await expect(response.json()).resolves.toMatchObject({
    schemaVersion: 1,
    collection: 'music',
    language: 'en',
    items: expect.arrayContaining([
      expect.objectContaining({
        id: 'swimming',
        url: `${SITE_URL}/favorites/music/swimming`,
      }),
    ]),
  });

  const missing = await request.get('/api/v1/content/games');
  expect(missing.status()).toBe(404);
  expect(await missing.json()).toEqual({ error: 'Collection not found' });
});

test('the head carries the icons and PWA tags Next generates', async ({ page }) => {
  await page.goto('/about');

  await expect(page.locator('link[rel="icon"]').first()).toHaveCount(1);
  await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveCount(1);
  await expect(page.locator('link[rel="manifest"]')).toHaveCount(1);

  // Both media-scoped theme colours, from the viewport export.
  await expect(page.locator('meta[name="theme-color"]')).toHaveCount(2);
});

test('per-page titles and descriptions are localized, not shared', async ({ page }) => {
  await page.goto('/about');
  const enTitle = await page.title();

  await page.goto('/es/about');
  const esTitle = await page.title();

  expect(enTitle).not.toBe(esTitle);
  for (const title of [enTitle, esTitle]) expect(title).toContain('Avery Peterson');
});
