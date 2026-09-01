import type { MetadataRoute } from 'next';
import { SITE_NAME } from '@/src/lib/metadata';

/**
 * Replaces the hand-maintained public/manifest.json.
 *
 * As a metadata route it is type-checked against the Web App Manifest spec —
 * a misspelled key or an invalid `display` value is now a build error rather
 * than something a browser silently ignores — and the app name comes from the
 * same constant the page titles use.
 *
 * Note this is served at /manifest.webmanifest, which is the convention's fixed
 * path; the <link rel="manifest"> in the root layout points at it.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: SITE_NAME,
    id: '/',
    start_url: '/',
    scope: '/',
    description: `${SITE_NAME}'s personal website.`,
    icons: [
      {
        src: '/favicons/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/favicons/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
    theme_color: '#ffffff',
    background_color: '#ffffff',
    display: 'standalone',
    display_override: ['window-controls-overlay'],
    orientation: 'portrait-primary',
    categories: ['personal', 'portfolio'],
    protocol_handlers: [
      {
        protocol: 'web+avery',
        url: '/?action=%s',
      },
    ],
    screenshots: [
      {
        src: '/screenshots/desktop-home.png',
        sizes: '2940x1665',
        type: 'image/png',
        form_factor: 'wide',
        label: 'Homepage view',
      },
      {
        src: '/screenshots/mobile-home.png',
        sizes: '688x1484',
        type: 'image/png',
        form_factor: 'narrow',
        label: 'Homepage view',
      },
    ],
  };
}
