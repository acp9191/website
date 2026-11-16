import { expect, test, type Locator, type Page } from '@playwright/test';
import { routing } from '@/src/i18n/routing';

/** Product of the computed opacity of an element and all its ancestors. */
const effectiveOpacity = (locator: Locator) =>
  locator.evaluate((node) => {
    let value = 1;
    for (let el: Element | null = node; el; el = el.parentElement) {
      value *= Number(getComputedStyle(el).opacity);
    }
    return value;
  });

/** Holds every JS chunk back until `release` is called, so hydration waits. */
async function gateHydration(page: Page) {
  let release!: () => void;
  const gate = new Promise<void>((resolve) => (release = resolve));
  await page.route('**/_next/static/chunks/**', async (route) => {
    await gate;
    await route.continue();
  });
  return release;
}

/*
  The gallery header, filters and every card used to sit at opacity 0 in the
  server HTML, revealed by IntersectionObservers after hydration. The priority
  covers are the page's LCP, so the largest paint waited on the bundle.
*/
test('the first cover is visible before hydration', async ({ page }) => {
  const release = await gateHydration(page);
  await page.goto('/favorites/music', { waitUntil: 'domcontentloaded' });

  // It still fades in, but on a CSS timer from the first paint: it must finish
  // while the bundle is held back.
  const cover = page.locator('main .grid img').first();
  await expect.poll(() => effectiveOpacity(cover), { timeout: 3000 }).toBe(1);
  release();
});

/*
  Cards in view on load fade in. A view timeline alone cannot do that: a card
  already in view sits at the end of its range and paints fully opaque, so the
  first rows need a time-based animation.
*/
test('the first row fades in on load', async ({ page }) => {
  await page.goto('/favorites/music', { waitUntil: 'commit' });
  const timed = await page
    .locator('main .grid > div')
    .first()
    .evaluate((el) =>
      el
        .getAnimations()
        .filter((a) => a.timeline instanceof DocumentTimeline)
        .map((a) => (a as CSSAnimation).animationName)
    );
  expect(timed).toContain('fadeUp');
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  // …and without JavaScript, nothing ever appeared.
  test('the heading and every card still appear', async ({ page }) => {
    await page.goto('/favorites/music');

    const heading = page.locator('main h1');
    await expect.poll(() => effectiveOpacity(heading)).toBe(1);

    const cards = page.locator('main .grid > div');
    const last = cards.last();
    await last.scrollIntoViewIfNeeded();
    await expect.poll(() => effectiveOpacity(last)).toBe(1);
    await expect.poll(() => effectiveOpacity(cards.first().locator('h2'))).toBe(1);
  });
});

/*
  Filtering changed the visible count badge but announced nothing, so a screen
  reader user had no feedback that the list had changed.
*/
test('a filter change is announced with the final count', async ({ page }) => {
  await page.goto('/favorites/music', { waitUntil: 'networkidle' });

  const live = page.locator('[aria-live="polite"]');
  const cards = page.locator('main .grid > div');
  const total = await cards.count();
  await expect(live).toHaveText(`${total} albums`);

  // The desktop sidebar's genre filter: pick the first genre after "All".
  await page.getByRole('combobox').first().click();
  await page.getByRole('option').nth(1).click();

  await expect.poll(() => cards.count()).toBeLessThan(total);
  const filtered = await cards.count();
  await expect(live).toHaveText(`${filtered} ${filtered === 1 ? 'album' : 'albums'}`);
});

// Card titles used to be <h3> directly under the page's <h1>, skipping a level.
test('card titles sit one level below the page heading', async ({ page }) => {
  await page.goto('/favorites/books');
  const cards = await page.locator('main .grid > div').count();
  await expect(page.locator('main .grid h2')).toHaveCount(cards);
  await expect(page.locator('main h3')).toHaveCount(0);
});

// The home headshot's alt was hard-coded English in every locale.
test('the home headshot alt is translated', async ({ page }) => {
  await page.goto('/es');
  await expect(page.locator('main img').first()).toHaveAttribute('alt', 'Foto de Avery Peterson');
});

/*
  Every page but the detail pages shared one meta description, so search
  results could not tell them apart.
*/
for (const locale of routing.locales) {
  test(`${locale} pages each have their own meta description`, async ({ page }) => {
    const prefix = locale === routing.defaultLocale ? '' : `/${locale}`;
    const descriptions: string[] = [];
    for (const path of [
      '',
      '/about',
      '/favorites/music',
      '/favorites/books',
      '/favorites/movies',
    ]) {
      await page.goto(`${prefix}${path}` || '/');
      const content = await page.locator('meta[name="description"]').getAttribute('content');
      expect(content, `${prefix}${path} needs a description`).toBeTruthy();
      descriptions.push(content!);
    }
    expect(new Set(descriptions).size).toBe(descriptions.length);
  });
}
