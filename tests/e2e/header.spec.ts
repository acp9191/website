import { expect, test, type Page } from '@playwright/test';
import { menuButton } from './helpers';

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

/** Height of the header's bar: 64px at the top of the page, 48px once compact. */
const headerBarHeight = (page: Page) =>
  page
    .locator('header > div > div')
    .first()
    .evaluate((el) => el.getBoundingClientRect().height);

/*
  The compact header used to follow scroll events only, so a page already
  scrolled when it hydrated kept the full-height header until the next scroll.
  Same bug, same test shape, as the scroll-to-top button in a11y.spec.ts.
*/
test('the header is compact for a page scrolled before hydration', async ({ page }) => {
  const release = await gateHydration(page);

  await page.goto('/favorites/music', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => window.scrollTo(0, 800));
  expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(20);

  release();
  await page.waitForLoadState('networkidle');

  await expect.poll(() => headerBarHeight(page)).toBe(48);
});

/*
  Mobile browsers resize the viewport whenever the address bar collapses or
  comes back, which happens on scroll. The menu used to close on any resize,
  so scrolling with it open shut it.
*/
test('the mobile menu survives a height-only resize, and closes at the breakpoint', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/about', { waitUntil: 'networkidle' });

  await menuButton(page).click();
  await expect(menuButton(page)).toHaveAttribute('aria-expanded', 'true');

  // The address bar reappearing.
  await page.setViewportSize({ width: 390, height: 760 });
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => r(null))));
  await expect(menuButton(page)).toHaveAttribute('aria-expanded', 'true');

  // Widening past `sm` hands over to the desktop nav, so the menu does close.
  await page.setViewportSize({ width: 1024, height: 760 });
  await expect(menuButton(page)).toHaveAttribute('aria-expanded', 'false');
});

/*
  The About headshot is the page's LCP element. It used to sit inside a section
  held at opacity 0 until an IntersectionObserver fired after hydration, so the
  largest paint waited on the JavaScript bundle. It must be visible from the
  server HTML alone.
*/
test('the About headshot is visible before hydration', async ({ page }) => {
  const release = await gateHydration(page);

  await page.goto('/about', { waitUntil: 'domcontentloaded' });

  const opacity = await page
    .locator('main img')
    .first()
    .evaluate((img) => {
      let value = 1;
      for (let el: Element | null = img; el; el = el.parentElement) {
        value *= Number(getComputedStyle(el).opacity);
      }
      return value;
    });

  release();
  expect(opacity).toBe(1);
});
