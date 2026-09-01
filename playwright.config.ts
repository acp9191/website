import { defineConfig, devices } from '@playwright/test';

/**
 * These run against a production build, not `next dev`.
 *
 * That is not incidental. The service worker is disabled in development, the
 * inline theme script and the prerendered metadata only take their real form in
 * a build, and the bug that lost the theme on a locale switch only reproduced
 * against `next start`. A dev server would pass while production stayed broken.
 *
 * `npm start` therefore needs an existing build: run `npm run build` first
 * (CI does this in its own step, so the build is not repeated here).
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['list']] : [['list']],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
