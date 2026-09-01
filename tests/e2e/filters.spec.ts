import { expect, test } from '@playwright/test';

/*
  Filters used to live only in React state, so a filtered view was neither
  reproducible nor addressable. They now map onto query parameters
  (/favorites/music?genre=Neo-Soul&artist=Mac%20Miller&year=2018) and these
  tests pin the mapping: picking filters rewrites the URL, a cold load of a
  filter URL renders the same view, and reset empties the query again.

  Selectors target the desktop sidebar: the three comboboxes in DOM order are
  Genre, Artist, Year. The mobile bar renders the same controls (hidden at
  desktop width), so options and triggers are matched by text and `:visible`
  where they could be ambiguous.
*/
const TRIGGERS = '[role="combobox"]';

async function selectFilter(page: import('@playwright/test').Page, optionText: string) {
  await page.locator('[role="option"]:visible', { hasText: optionText }).first().click();
}

test('picking filters writes them to the URL', async ({ page }) => {
  await page.goto('/favorites/music');

  await page.locator(TRIGGERS).nth(0).click();
  await selectFilter(page, 'Neo-Soul');
  await page.waitForURL((url) => url.searchParams.get('genre') === 'Neo-Soul');

  await page.locator(TRIGGERS).nth(1).click();
  await selectFilter(page, 'Mac Miller');
  await page.waitForURL((url) => url.searchParams.get('artist') === 'Mac Miller');

  await page.locator(TRIGGERS).nth(2).click();
  await selectFilter(page, '2018');
  await page.waitForURL((url) => url.searchParams.get('year') === '2018');

  const url = new URL(page.url());
  expect(url.searchParams.get('genre')).toBe('Neo-Soul');
  expect(url.searchParams.get('artist')).toBe('Mac Miller');
  expect(url.searchParams.get('year')).toBe('2018');

  // The three filters combine: only "Swimming" fits all of them.
  await expect(page.locator('h3')).toHaveText(['Swimming']);
});

test('a URL with filters restores the same view on a cold load', async ({ page }) => {
  await page.goto('/favorites/music?genre=Neo-Soul&artist=Mac%20Miller&year=2018');

  await expect(page.locator('h3')).toHaveText(['Swimming']);

  // The dropdowns remember the selection instead of falling back to "All".
  await expect(page.locator(TRIGGERS).nth(0)).toHaveText('Neo-Soul');
  await expect(page.locator(TRIGGERS).nth(1)).toHaveText('Mac Miller');
  await expect(page.locator(TRIGGERS).nth(2)).toHaveText('2018');
});

test('reset clears the filters and the query string', async ({ page }) => {
  await page.goto('/favorites/music?genre=Neo-Soul&artist=Mac%20Miller&year=2018');
  await expect(page.locator('h3')).toHaveText(['Swimming']);

  await page.locator('button:visible', { hasText: 'Reset' }).first().click();

  await page.waitForURL((url) => url.searchParams.size === 0);
  // At least the one album from before is back, and all genres with it.
  await expect(page.locator('h3').first()).not.toHaveText('Swimming');
  expect(await page.locator('h3').count()).toBeGreaterThan(1);
});

test('a filter present in the URL renders server-side before hydration', async ({ page }) => {
  await page.goto('/favorites/music?genre=Neo-Soul');

  // The genre gate alone leaves "Neo-Soul" albums (incl. Swimming) but not "Aja".
  await expect(page.locator('h3', { hasText: 'Swimming' })).toHaveCount(1);
  await expect(page.locator('h3', { hasText: 'Aja' })).toHaveCount(0);
  await expect(page.locator(TRIGGERS).nth(0)).toHaveText('Neo-Soul');
});
