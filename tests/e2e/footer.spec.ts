import { expect, test } from '@playwright/test';

/*
  The copyright year used to be computed during render in a client component.
  The prerendered HTML carries the build's year; the browser recomputed it on
  hydration, so once the calendar passed New Year without a redeploy the two
  disagreed and React threw a hydration mismatch. Only the server computes it
  now. Freezing the browser's clock in the following year reproduces the
  rollover without waiting for one.
*/
test('the copyright year hydrates without a mismatch after New Year', async ({ page, request }) => {
  const html = await (await request.get('/about')).text();
  const serverYear = Number(html.match(/© (\d{4})/)?.[1]);
  expect(serverYear).toBeGreaterThan(2000);

  await page.clock.setFixedTime(new Date(`${serverYear + 1}-01-01T12:00:00`));

  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', (err) => errors.push(err.message));

  await page.goto('/about');
  await page.waitForLoadState('networkidle');

  // The browser really is in the next year, so a client-side recompute would show it.
  expect(await page.evaluate(() => new Date().getFullYear())).toBe(serverYear + 1);

  await expect(page.locator('footer')).toContainText(`© ${serverYear} `);
  expect(errors.filter((e) => /hydrat/i.test(e))).toEqual([]);
});
