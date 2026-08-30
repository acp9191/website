/// <reference no-default-lib="true" />
/// <reference lib="esnext" />
/// <reference lib="webworker" />

import { defaultCache } from '@serwist/next/worker';
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist';
import { ExpirationPlugin, NetworkFirst, Serwist } from 'serwist';

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    {
      /*
        Navigations, handled before defaultCache gets a look.

        defaultCache ships a `pages` rule intended for this, but it tests the
        *request's* `Content-Type` header — which navigation requests never
        send — so it never matches. HTML documents fell through to its generic
        `others` bucket and were cached for 24 hours.

        The effect after a deploy: a returning visitor is served a document
        from the previous build, whose script tags point at chunk hashes that
        no longer exist. Those 404, and React then fails to hydrate the stale
        markup against the new bundle.

        NetworkFirst with a short timeout keeps the page working offline while
        making a fresh document the normal case.
      */
      matcher: ({ request }) => request.mode === 'navigate',
      handler: new NetworkFirst({
        cacheName: 'pages',
        networkTimeoutSeconds: 10,
        plugins: [new ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 60 * 60 * 24 })],
      }),
    },
    ...defaultCache,
  ],
});

serwist.addEventListeners();
