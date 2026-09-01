import type { Page } from '@playwright/test';

/**
 * Selectors here avoid anything the user can see, because the visible text and
 * the aria-labels are all translated — a selector built from them would only
 * work in the locale it was written for.
 *
 * The desktop locale switcher is the only `aria-expanded` control inside <nav>:
 * the theme toggle has no such attribute, and the hamburger is a sibling of
 * <nav>, not a child.
 */
export const localeTrigger = (page: Page) => page.locator('nav button[aria-expanded]').first();
export const menuButton = (page: Page) => page.locator('button[aria-controls]').first();

/**
 * Stamps every document with an id, so a test can tell a client-side navigation
 * (id survives) from a full page load (id is regenerated).
 */
export async function trackDocumentIdentity(page: Page) {
  await page.addInitScript(() => {
    (window as unknown as { __docId: string }).__docId = Math.random().toString(36).slice(2);
  });
}

export const documentId = (page: Page) =>
  page.evaluate(() => (window as unknown as { __docId: string }).__docId);

export type ThemeSnapshot = {
  dark: boolean;
  dataTheme: string | undefined;
  stored: string | null;
};

export const readTheme = (page: Page): Promise<ThemeSnapshot> =>
  page.evaluate(() => ({
    dark: document.documentElement.classList.contains('dark'),
    dataTheme: document.documentElement.dataset.theme,
    stored: localStorage.getItem('theme'),
  }));

/** Seeds the stored preference, then loads `path` so the head script applies it. */
export async function visitWithTheme(page: Page, path: string, theme: string) {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.evaluate((t) => localStorage.setItem('theme', t), theme);
  await page.goto(path, { waitUntil: 'networkidle' });
}

/**
 * Switches locale through the desktop dropdown, by the locale's own name.
 *
 * Waits on the destination URL rather than a load state: the switch is a
 * navigation, and `networkidle` can resolve before it has even started.
 */
export async function switchLocaleDesktop(page: Page, name: string, expectedPath: string) {
  await localeTrigger(page).click();

  const option = page.locator(`nav .relative button:has-text("${name}")`).last();
  await option.waitFor({ state: 'visible' });
  await option.click();

  await page.waitForURL((url) => url.pathname === expectedPath);
  await page.waitForLoadState('networkidle');
}

/** Switches locale through the mobile menu's native <select>. */
export async function switchLocaleMobile(page: Page, code: string, expectedPath: string) {
  await menuButton(page).click();

  const select = page.locator('select');
  await select.waitFor({ state: 'visible' });
  await select.selectOption(code);

  await page.waitForURL((url) => url.pathname === expectedPath);
  await page.waitForLoadState('networkidle');
}
