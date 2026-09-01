import { expect, test } from '@playwright/test';

/** Matches the Cloudinary source width MediaCard requests. */
const COVER_SOURCE_WIDTH = 1280;

test('the files browsers and installers ask for are all served', async ({ request }) => {
  // /favicon.ico is the one browsers request unprompted. It 404'd for a long
  // time because the file lived under /favicons/ and nothing referenced it.
  for (const path of [
    '/favicon.ico',
    '/icon.png',
    '/apple-icon.png',
    '/manifest.webmanifest',
    '/robots.txt',
    '/sitemap.xml',
    '/sw.js',
  ]) {
    expect((await request.get(path)).status(), `${path} should be served`).toBe(200);
  }
});

test('the service worker is a real bundle, not an empty file', async ({ request }) => {
  const body = await (await request.get('/sw.js')).text();

  // @serwist/next silently emits nothing under Turbopack, and the build still
  // succeeds; a stub or missing worker means the PWA is dead.
  expect(body.length).toBeGreaterThan(1000);
  expect(body).toContain('serwist');
});

/*
  next/font defines --font-inter as `"Inter", "Inter Fallback"`, where the second
  face carries metric overrides so the swap does not shift the layout.
  Redeclaring --font-inter in CSS overwrites that at equal specificity, which is
  exactly what globals.css used to do — the fallback face was never loaded and
  the shift came back.
*/
test('the metric-matched font fallback is the one actually in use', async ({ page }) => {
  await page.goto('/about');

  const fontFamily = await page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue('--font-inter').trim()
  );
  expect(fontFamily).toContain('Inter Fallback');
  expect(fontFamily).not.toContain('system-ui');

  /*
    Declared, not loaded. The fallback face is sourced with `local()`, so whether
    it ever loads depends on which fonts the machine has — it resolves on macOS
    and not in a headless Linux container. Its presence in the document's font
    set is the part that is actually about this site.
  */
  const declared = await page.evaluate(async () => {
    await document.fonts.ready;
    return [...document.fonts].some((f) => f.family.includes('Fallback'));
  });
  expect(declared, 'next/font should declare a metric-matched fallback face').toBe(true);

  expect(await page.evaluate(() => getComputedStyle(document.body).fontFamily)).toContain('Inter');
});

/*
  Next never upscales past the source it was given, so a srcset candidate wider
  than that source resolves to the same image under a larger label — pure page
  weight. deviceSizes ran to 3840 while the source caps at 1280.
*/
test('no srcset candidate is wider than the source image', async ({ page }) => {
  await page.goto('/favorites/music');

  const widths = await page.evaluate(() =>
    [...document.querySelectorAll('img[srcset]')].flatMap((img) =>
      (img.getAttribute('srcset') ?? '')
        .split(',')
        .map((c) => parseInt(c.trim().split(' ')[1] ?? '0', 10))
    )
  );

  expect(widths.length).toBeGreaterThan(0);
  expect(Math.max(...widths)).toBeLessThanOrEqual(COVER_SOURCE_WIDTH);
});

test('covers declare a sizes attribute matching the slot they occupy', async ({ page }) => {
  await page.goto('/favorites/music');

  const sizes = await page.locator('img[srcset]').first().getAttribute('sizes');

  // A `33vw` claim here overstated the column, which is capped near 320px by
  // the max-w-7xl row and the fixed sidebar.
  expect(sizes).toBeTruthy();
  expect(sizes).not.toContain('33vw');
});

test('the CSP allows only origins the site actually uses', async ({ request }) => {
  const csp = (await request.get('/')).headers()['content-security-policy'];
  expect(csp).toBeTruthy();

  // Allowances for services this site has never used drifted in and stayed.
  expect(csp).not.toContain('challenges.cloudflare.com');
  expect(csp).toContain("frame-ancestors 'none'");
  expect(csp).toContain("object-src 'none'");

  // Nothing is embedded; trailers and albums are outbound links, not iframes.
  expect(csp).toContain("frame-src 'none'");
});

test('security headers are present', async ({ request }) => {
  const headers = (await request.get('/')).headers();
  expect(headers['x-content-type-options']).toBe('nosniff');
  expect(headers['strict-transport-security']).toContain('max-age=');
  expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
});

test('the manifest stays installable and its icons resolve', async ({ request }) => {
  const manifest = await (await request.get('/manifest.webmanifest')).json();

  expect(manifest.name).toBeTruthy();
  expect(manifest.start_url).toBeTruthy();
  expect(manifest.display).toBe('standalone');

  for (const icon of manifest.icons ?? []) {
    expect((await request.get(icon.src)).status(), `${icon.src} should exist`).toBe(200);
  }
  for (const shot of manifest.screenshots ?? []) {
    expect((await request.get(shot.src)).status(), `${shot.src} should exist`).toBe(200);
  }
});
