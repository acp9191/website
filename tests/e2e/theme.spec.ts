import { expect, test } from '@playwright/test';
import {
  documentId,
  readTheme,
  switchLocaleDesktop,
  switchLocaleMobile,
  trackDocumentIdentity,
  visitWithTheme,
} from './helpers';

/*
  `[locale]` sits above the root layout, so switching language remounts it and
  React rebuilds <html> from its own props. The `dark` class and `data-theme`
  are written imperatively by the inline head script, so React does not know
  they exist and discarded them — a reader who chose dark mode landed on a light
  page. ThemeSync puts them back in a layout effect.

  This only reproduces against a production build with a client-side
  navigation, which is why these run against `npm start`.
*/
/*
  `nav` records which kind of navigation the switch performs, and the tests
  assert it.

  This is not incidental detail. Adding a locale prefix is a client-side
  navigation, which remounts the layout and is where the bug lived. Dropping the
  prefix — switching back to the default locale — is a full page load, so the
  inline head script re-applies the theme and the bug cannot appear. Without
  pinning this down, two of these cases pass for the wrong reason, and a future
  Next release that turned every switch into a full load would leave the whole
  file green while covering nothing.
*/
const CASES = [
  {
    from: '/about',
    to: 'Español',
    at: '/es/about',
    theme: 'dark',
    scheme: 'light' as const,
    nav: 'client',
  },
  {
    from: '/es/about',
    to: 'English',
    at: '/about',
    theme: 'dark',
    scheme: 'light' as const,
    nav: 'document',
  },
  { from: '/', to: 'Deutsch', at: '/de', theme: 'dark', scheme: 'light' as const, nav: 'client' },
  {
    from: '/about',
    to: 'Español',
    at: '/es/about',
    theme: 'light',
    scheme: 'dark' as const,
    nav: 'client',
  },
  {
    from: '/es/about',
    to: 'English',
    at: '/about',
    theme: 'light',
    scheme: 'dark' as const,
    nav: 'document',
  },
  {
    from: '/about',
    to: 'Español',
    at: '/es/about',
    theme: 'system',
    scheme: 'dark' as const,
    nav: 'client',
  },
  {
    from: '/favorites/music',
    to: 'Español',
    at: '/es/favorites/music',
    theme: 'dark',
    scheme: 'light' as const,
    nav: 'client',
  },
] as const;

for (const { from, to, at, theme, scheme, nav } of CASES) {
  test(`theme "${theme}" survives ${from} -> ${to} (OS ${scheme}, ${nav} nav)`, async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: scheme });
    await trackDocumentIdentity(page);
    await visitWithTheme(page, from, theme);

    const before = await readTheme(page);
    const documentBefore = await documentId(page);

    await switchLocaleDesktop(page, to, at);

    expect(new URL(page.url()).pathname).toBe(at);

    const sameDocument = (await documentId(page)) === documentBefore;
    expect(sameDocument, `expected a ${nav}-side navigation`).toBe(nav === 'client');

    expect(await readTheme(page)).toEqual(before);
  });
}

test('at least one case exercises the client-side path the bug lived on', () => {
  expect(CASES.some((c) => c.nav === 'client')).toBe(true);
});

test('theme survives a locale switch from the mobile menu', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ colorScheme: 'light' });
  await visitWithTheme(page, '/about', 'dark');

  const before = await readTheme(page);
  await switchLocaleMobile(page, 'es', '/es/about');

  expect(new URL(page.url()).pathname).toBe('/es/about');
  expect(await readTheme(page)).toEqual(before);
});

test('a cold load applies the theme before hydration, with no light flash', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.addInitScript(() => {
    (window as unknown as { __atParse?: unknown }).__atParse = null;
    document.addEventListener('readystatechange', () => {
      const w = window as unknown as { __atParse?: unknown };
      if (!w.__atParse && document.readyState === 'interactive') {
        w.__atParse = {
          dark: document.documentElement.classList.contains('dark'),
          dataTheme: document.documentElement.dataset.theme,
        };
      }
    });
  });

  await visitWithTheme(page, '/about', 'dark');

  // Already dark at the first point a script can observe the document, i.e.
  // before React has hydrated anything.
  expect(
    await page.evaluate(() => (window as unknown as { __atParse: unknown }).__atParse)
  ).toEqual({
    dark: true,
    dataTheme: 'dark',
  });
});

test('an unrecognised stored preference is normalised to system', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await visitWithTheme(page, '/about', 'not-a-theme');

  const { dataTheme, dark } = await readTheme(page);
  expect(dataTheme).toBe('system');
  expect(dark).toBe(true); // system, and the OS prefers dark
});
