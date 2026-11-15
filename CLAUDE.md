# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
npm run dev           # Start development server on http://localhost:3000
npm run build         # Build for production (includes type checking)
npm start             # Start production server
npm run lint          # Oxlint
npm run typecheck     # tsc --noEmit
npm run format        # Prettier, writing changes
npm run format:check  # Prettier, failing instead of writing
npm run check:content # Validate content frontmatter and genre spellings
npm run test          # Vitest, unit and invariant tests
npm run test:watch    # Vitest in watch mode
npm run test:e2e      # Playwright, needs a build first (see below)
```

`postbuild` runs `scripts/check-sw.mjs`, which fails the build if no service
worker was emitted. `@serwist/next` only runs under webpack; a bare `next build`
uses Turbopack, skips it, and still exits 0 — so the `--webpack` flag is
load-bearing and this is what makes removing it fail loudly.

`build` passes `--webpack` on purpose: Serwist's service-worker compilation does
not run under Turbopack. `next dev` still uses Turbopack.

CI (`.github/workflows/ci.yml`) runs lint, typecheck, format:check,
check:content, unit tests, build and end-to-end tests on every PR, each step
guarded by `if: !cancelled()` so one push surfaces every failure.

## Project Architecture

This is a Next.js 16 personal website featuring a multilingual media gallery system (music albums, movies, books) with PWA support.

### Tech Stack

- **Framework**: Next.js 16 (App Router; Turbopack in dev, webpack for builds)
- **Styling**: Tailwind CSS v4
- **Internationalization**: next-intl 4 (en, es, fr, it, de)
- **PWA**: Service worker with Serwist (disabled in dev, enabled in production)
- **Content**: Markdown files with gray-matter frontmatter parsing
- **Linting**: Oxlint, configured in `.oxlintrc.json` with its `typescript`,
  `react`, `nextjs` and `jsx-a11y` plugins. Replaced ESLint, partly because
  typescript-eslint cannot load under TypeScript 7. Oxlint's default
  `correctness` category does most of the work; the config only adds the old
  ESLint rules that fall outside it, and switches off one false positive (see
  the comments in the file). The `react` plugin carries
  the React Compiler rules (`static-components`, `set-state-in-effect`,
  `purity`) that used to come from eslint-plugin-react-hooks; they caught real
  bugs here, so keep them. Oxlint is native and never loads the `typescript`
  package
- **TypeScript**: 7 (native `tsc`). It ships no JS API, which nothing here needs:
  Next 16.4 type-checks by spawning `tsc` rather than calling the API

### Key Architectural Patterns

**Internationalized Routing**

- All routes are under `src/app/[locale]/` dynamic segment
- Proxy (`src/proxy.ts`) handles locale detection and routing (Next.js 16 convention)
- Locale configuration in `src/i18n/routing.ts` with 5 supported languages
- Translation files in `messages/*.json` (one per locale)
- Path alias `@/*` maps to root directory

**Content Management**

- Content stored as Markdown files in `content/{albums,movies,books}/`
- Each file has YAML frontmatter (title, artist/author/director, image URL, year, genres, optional external links)
- Loaded by `loadContent(collection)` in `src/lib/content.ts`, which parses every `.md` in the directory and sorts by title;
  `collection` is typed as one of `CONTENT_COLLECTIONS`
- Each entry gets a `slug` from its filename — this is its detail-page URL and API identifier, so renaming a file changes a public URL
- Markdown body (trimmed) becomes the description
- Two names exist for each collection: the content directory (`albums`, `books`, `movies`) and the URL section
  (`music`, `books`, `movies`). `MEDIA_CONFIG` in `src/lib/media.ts` maps one to the other, along with each
  section's schema.org type, creator key, image key and translation namespace
- `scripts/check-content.mjs` validates required fields, rejects unknown ones
  (most often the wrong image key) and flags genre values that differ only by
  case or punctuation, since those silently split one filter entry into two
- Server components read files at build/request time using `fs/promises` and `gray-matter`

**Media Gallery System**

- Reusable `MediaGallery` component (`src/components/MediaGallery/`) powers all three galleries
- Three specialized page components: `MusicGallery.tsx`, `MovieGallery.tsx`, `BookGallery.tsx`
- Each page loads its content directory, transforms to `MediaItem[]`, and renders `MediaGallery`
- Filtering system with three dimensions (category/genre, subtitle/artist/director/author, year); the three combine with AND
- `FilterDropdown` is one component with a `variant` of `sidebar` or `bar`, used by both the desktop sidebar and the mobile filter row
- Responsive design with separate desktop/mobile filter layouts
- Custom hooks in `src/components/MediaGallery/hooks/`:
  - `useMediaGalleryFilters`: Filter state management
  - `useListbox`: Keyboard, focus and dismissal behaviour for the filter dropdowns
- `src/hooks/useRevealOnScroll.ts` is the single reveal-on-scroll observer, used
  by the gallery header and both filter layouts. The home and about pages
  animate in CSS instead (`animate-slide-up` / `animate-fade-up`): their
  headshot is the LCP element, and an observer would hold it at opacity 0
  until hydration
- `src/hooks/useScrolledPast.ts` reads `window.scrollY` through
  `useSyncExternalStore`, not from scroll events, so a page already scrolled
  when it hydrates is handled. Both the compact header and the scroll-to-top
  button use it (`a11y.spec.ts`)

**Detail Pages, Structured Data and the Content API**

- Each item has a statically generated page at `favorites/{music,books,movies}/[slug]`
  (`dynamicParams = false`, so unknown slugs 404). The three route files are thin
  wrappers around `MediaDetailPage` / `mediaMetadata` / `mediaStaticParams` in
  `src/components/MediaDetailPage.tsx`, which renders `MediaDetail`
- Per-item metadata comes from `buildMediaMetadata` in `src/lib/metadata.ts`
- JSON-LD is built in `src/lib/structuredData.ts` and emitted by `src/components/JsonLd.tsx`:
  the root layout carries the site graph (`Person` + `WebSite`, with stable `#person` / `#website`
  IDs); gallery and detail pages add their collection or item
- The `Person`'s `sameAs` and the footer icons both come from `SOCIAL_LINKS` in
  `src/lib/social.ts`; add a profile there and it appears in both
- `GET /api/v1/content` (every item, plus per-collection counts) and
  `GET /api/v1/content/{music,books,movies}` serve the content as versioned JSON
  (`schemaVersion: 1`, English only), built by `src/lib/contentApi.ts`. Changing the
  item shape is a breaking change for consumers — bump `schemaVersion`
- The sitemap includes every detail page in every locale

**Theme System**

- Dark mode implemented with Tailwind's dark class strategy
- Initial theme set via inline script in `src/app/[locale]/layout.tsx` (prevents flash)
- Theme toggle in `Header` persists to localStorage
- `SiteLayout` (header, main, footer) is a server component; `Header` is a
  client component on its own, while `Footer` must stay on the server — it
  reads the copyright year at module load, and a `'use client'` on either file
  would make the browser recompute it and break hydration after New Year
  (`footer.spec.ts`)
- PWA theme-color meta tags respect user's color scheme preference

**Image Hosting**

- All media covers hosted on Cloudinary (`res.cloudinary.com/acp`)
- Next.js Image component configured for Cloudinary domain in `next.config.ts`
- `getOptimizedImageUrl` returns the *source* handed to Next's optimizer, not
  what the browser downloads; `deviceSizes` is capped at that source width so
  the srcset carries no candidates that resolve to a smaller image

**Fonts**

- Inter is loaded by `next/font` in the root layout, which defines
  `--font-inter` on `<html>` as `"Inter", "Inter Fallback"` — the second face
  carries metric overrides that prevent layout shift on swap
- `globals.css` feeds that variable to Tailwind's `--font-sans` via
  `@theme inline`. Never redeclare `--font-inter` in CSS: `:root` and
  next/font's class have equal specificity, so doing so overwrites the
  metric-matched fallback and reintroduces the shift

**PWA Architecture**

- Service worker source: `src/app/sw.ts` (compiled to `public/sw.js` at build using Serwist)
- Config: `next.config.ts` with PWA disabled in dev mode
- Service worker uses `skipWaiting`, `clientsClaim`, and `navigationPreload` for immediate activation
- Navigations (`request.mode === 'navigate'`) hit a custom `NetworkFirst` rule
  (cache `pages`, 10s network timeout) placed **before** `defaultCache`.
  `defaultCache`'s own `pages` rule tests the request's `Content-Type`, which
  navigations never send, so HTML used to fall through to a 24-hour cache and
  serve documents pointing at the previous deploy's chunks. Keep this rule first
- Everything else via `defaultCache` from `@serwist/next/worker`:
  - **Precaching**: Static assets (JS, CSS, fonts, icons) via `self.__SW_MANIFEST`
  - **NetworkFirst**: API routes, RSC data
  - **CacheFirst**: Static JS chunks, audio/video
  - **StaleWhileRevalidate**: Images, fonts, CSS
- Key cache stores: `serwist-precache-v2`, `pages` (navigations), `next-image`, `pages-rsc-prefetch`
- `src/app/sw.ts` is excluded from the main `tsconfig.json` (Serwist compiles it independently)
- Manifest: generated by `src/app/manifest.ts` (served as `/manifest.webmanifest`)
  with icons and screenshots

### File Structure Conventions

- Server components: `src/app/[locale]/**/page.tsx`
- Client components: Use `'use client'` directive (e.g., all MediaGallery components)
- Shared types: `src/components/MediaGallery/types.ts` defines `MediaItem`, `FilterConfig`, `FilterState`
- Content files: Follow naming convention `{slug}.md` in respective content directories

### Adding New Content

1. Create `.md` file in appropriate content directory (`content/albums/`, `content/movies/`, `content/books/`)
2. Include required frontmatter fields:
   - Music: `title`, `artist`, `cover`, `year`, `genres`, optional `spotify`
   - Movies: `title`, `director`, `poster`, `year`, `genres`, optional `trailer`
   - Books: `title`, `author`, `cover`, `year`, `genres`

   Note the image field differs by collection: movies use `poster`, albums and
   books use `cover`.
3. Add description in markdown body
4. Content auto-loads on next build/page request

### Localization Workflow

- Update `messages/{locale}.json` files when adding UI text
- Each gallery has its own translation namespace (Music, Movies, Books)
- Labels identical across all three galleries (genre, year, reset, scrollToTop,
  filterBy) live in the shared `Gallery` namespace instead of being repeated
- `all` stays per-gallery on purpose: in gendered languages the "All" sentinel
  agrees with the noun it stands in for (es: "Todas" películas, "Todos" álbumes)
- Component props accept `translationNamespace` to scope translations; gallery
  components receive both `t` (their namespace) and `tGallery` (the shared one)
- Header/Footer translations in respective namespaces
- Prefer `t.rich` over splicing markup into translated strings

### Build Notes

- TypeScript strict mode is enabled (`tsconfig.json`)
- `SITE_URL` in `src/lib/metadata.ts` must match the host that actually serves
  the site (currently `www`); the apex redirects to it, and pointing canonicals
  at a redirecting host is what this constant exists to avoid
- `npm run typecheck` includes `.next/types`, so a stale build directory can
  report errors for deleted routes — `rm -rf .next` if that happens
- Prettier owns formatting; `.prettierignore` excludes generated and tool-owned
  files (including this one, which `next dev` rewrites)
- `public/og-image.jpg` must be the 1200×630 that `buildMetadata` declares;
  `metadata.test.ts` reads its real dimensions and size from disk
- Service worker generated in `public/sw.js` during production build
- `sitemap.xml`, `robots.txt`, `manifest.webmanifest` and the icons are all
  metadata routes/files under `src/app/`, not hand-written files in `public/`:
  - `src/app/sitemap.ts` — returns `MetadataRoute.Sitemap`; Next renders the XML
    including the `xhtml:link` hreflang alternates
  - `src/app/robots.ts`, `src/app/manifest.ts` — typed against their specs
  - `src/app/favicon.ico`, `icon.png`, `apple-icon.png` — the file convention,
    which is also what makes a root `/favicon.ico` request resolve
  - `theme-color` and the apple-web-app meta tags come from the `viewport` and
    `metadata.appleWebApp` exports in `src/app/[locale]/layout.tsx`
- PWA features only work in production mode (`npm start`), not development (`npm run dev`)

## Testing

Two suites, split by what they can actually observe.

**`npm run test` — Vitest, `tests/unit/`.** Pure invariants, no DOM, no server:

- `messages.test.ts` — the five locale files have identical keys, no blank
  strings, and every ICU placeholder and rich-text tag survives translation. A
  translator dropping `{title}` or `<wave>` is otherwise silent.
- `theme.test.ts` — `normalizeTheme` rejects junk, and the inline `<head>`
  script is executed against a stub DOM and asserted to agree with it. That
  duplication has drifted before, and a comment was not enough to stop it.
- `metadata.test.ts` — the `localePrefix: 'as-needed'` rules, and the sitemap /
  robots / manifest routes as pure functions, including that the manifest's
  icons exist on disk.
- `content.test.ts` — every entry has the image key its own gallery reads, no
  duplicate titles, sorted output.
- `content-api.test.ts` — the `/api/v1` payloads: versioned, every collection
  present, item counts consistent, canonical IDs and URLs on every item.
- `structured-data.test.ts` — the site graph keeps its stable `Person` /
  `WebSite` IDs, and collections and items carry the right schema.org shape.
  Collections link to the site through `isPartOf`; items are standalone, with
  `@id` set to `{detail URL}#item`.

**`npm run test:e2e` — Playwright, `tests/e2e/`.** Runs against a production
build, because that is the only place several of these bugs exist: the service
worker is disabled in dev, and the theme-on-locale-switch bug needs a
client-side navigation that only happens in a build. Run `npm run build` first;
CI builds in its own step.

- `theme.spec.ts` — the theme survives a locale switch. Each case also asserts
  **which kind of navigation** it performed: adding a locale prefix is
  client-side and remounts the layout (where the bug lived), while dropping the
  prefix is a full page load where the inline script covers it anyway. Without
  that assertion two cases would pass for the wrong reason.
- `a11y.spec.ts` — nothing hidden by opacity stays focusable, and an unrelated
  re-render does not steal focus from an open dropdown.
- `metadata.spec.ts` — every canonical, hreflang and sitemap URL resolves
  without a redirect, and a localized detail page's canonical agrees with its
  JSON-LD identity. Fetched from a fresh request context each time: the proxy
  redirects on a stored locale preference, and a shared cookie jar makes correct
  behaviour look broken.
- `assets.spec.ts` — the files browsers request unprompted are served, the
  metric-matched font fallback is the one in use, no srcset candidate exceeds
  the source width, and the CSP carries no origins the site does not use.
- `header.spec.ts` — the header is compact for a page scrolled before
  hydration, the mobile menu survives the height-only resizes a mobile address
  bar causes, and the About headshot (its LCP element) is visible before any
  JavaScript runs.
- `footer.spec.ts` — with the browser's clock frozen in the year after the
  build, the footer still shows the build's year and hydration reports no
  mismatch.

When adding a test for a bug, check it fails against the bug. Every test here
was verified that way — the fix reverted, the test observed to fail, the fix
restored.

### Testing PWA

```bash
npm run build && npm start
```

- DevTools → Application → Service Workers (should show "activated")
- DevTools → Cache Storage (should show `serwist-precache-v2-*` and other serwist caches)
- Console: `!!navigator.serviceWorker.controller` (should be true)
- Test offline: Browse pages, enable Network offline mode, refresh

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
