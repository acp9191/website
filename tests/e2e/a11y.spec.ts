import { expect, test } from '@playwright/test';
import { menuButton } from './helpers';

/*
  Both of these controls are hidden with opacity and max-height rather than being
  unmounted, which hides them visually but leaves them in the tab order and the
  accessibility tree. `inert` is what takes them out of both. A regression here
  is invisible to anyone using a mouse.
*/
test.describe('controls hidden by opacity stay out of the tab order', () => {
  test('the collapsed mobile menu is inert, and stops being inert when opened', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/about');

    const menu = page.locator(`#${await menuButton(page).getAttribute('aria-controls')}`);
    const links = menu.locator('a');

    await expect(menu).toHaveAttribute('inert', '');
    expect(await links.count()).toBeGreaterThan(0);

    // Nothing inside it can take focus while it is shut.
    for (const link of await links.all()) {
      await link.evaluate((el: HTMLElement) => el.focus());
    }
    expect(await page.evaluate(() => document.activeElement?.tagName)).not.toBe('A');

    await menuButton(page).click();
    await expect(menu).not.toHaveAttribute('inert', '');

    // …and can once it is open, which is what makes the check above meaningful.
    await links.first().evaluate((el: HTMLElement) => el.focus());
    expect(await page.evaluate(() => document.activeElement?.tagName)).toBe('A');
  });

  test('the hamburger announces its state', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/about');

    await expect(menuButton(page)).toHaveAttribute('aria-expanded', 'false');
    await menuButton(page).click();
    await expect(menuButton(page)).toHaveAttribute('aria-expanded', 'true');
  });

  test('the scroll-to-top button is inert until it is shown', async ({ page }) => {
    await page.goto('/favorites/music');

    const button = page.locator('button.fixed.bottom-6');
    await expect(button).toHaveAttribute('inert', '');

    await page.evaluate(() => window.scrollTo(0, 800));
    await expect(button).not.toHaveAttribute('inert', '');
  });
});

/*
  The filter dropdowns focus the selected option when they open. That effect
  used to depend on the `options` array, which every call site builds inline, so
  it re-ran on renders that had nothing to do with opening — and snatched focus
  back from whatever the user had arrowed to. Crossing the scroll-to-top
  threshold is enough to trigger such a render.
*/
test('an unrelated re-render does not steal focus from an open dropdown', async ({ page }) => {
  await page.goto('/favorites/music');

  const trigger = page.locator('[role="combobox"]').first();
  await trigger.click();

  const listbox = page.locator('[role="listbox"]').first();
  await expect(listbox).toBeVisible();

  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  const focused = await page.evaluate(() => document.activeElement?.textContent);

  // Cross the 400px threshold, which flips state in the gallery and re-renders it.
  await page.evaluate(() => window.scrollTo(0, 800));
  await expect(page.locator('button.fixed.bottom-6')).not.toHaveAttribute('inert', '');

  expect(await page.evaluate(() => document.activeElement?.textContent)).toBe(focused);
});

test('every filter dropdown is a labelled combobox', async ({ page }) => {
  await page.goto('/favorites/music');

  const triggers = page.locator('[role="combobox"]');
  expect(await triggers.count()).toBeGreaterThan(0);

  for (const trigger of await triggers.all()) {
    await expect(trigger).toHaveAttribute('aria-label', /.+/);
    await expect(trigger).toHaveAttribute('aria-expanded', /true|false/);
    await expect(trigger).toHaveAttribute('aria-controls', /.+/);
  }
});

/*
  Landmarks are implied by the elements themselves; restating them as roles is
  redundant and drifts out of sync with the markup.
*/
test('landmarks carry no redundant roles', async ({ page }) => {
  await page.goto('/about');
  expect(
    await page
      .locator('[role="main"], [role="banner"], [role="contentinfo"], [role="navigation"]')
      .count()
  ).toBe(0);
});

test('reduced motion collapses the reveal transitions', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/about');

  const duration = await page
    .locator('section')
    .first()
    .evaluate((el) => getComputedStyle(el).transitionDuration);

  // 0.01ms, i.e. effectively instant, rather than the 700ms reveal.
  expect(parseFloat(duration)).toBeLessThan(0.01);
});
