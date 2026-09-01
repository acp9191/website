# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
npm run dev           # Start development server on http://localhost:3000
npm run build         # Build for production (includes type checking)
npm start             # Start production server
npm run lint          # ESLint
npm run typecheck     # tsc --noEmit
npm run format        # Prettier, writing changes
npm run format:check  # Prettier, failing instead of writing
npm run check:content # Validate content frontmatter and genre spellings
```

`postbuild` runs `scripts/check-sw.mjs`, which fails the build if no service
worker was emitted. `@serwist/next` only runs under webpack; a bare `next build`
uses Turbopack, skips it, and still exits 0 — so the `--webpack` flag is
load-bearing and this is what makes removing it fail loudly.

`build` passes `--webpack` on purpose: Serwist's service-worker compilation does
not run under Turbopack. `next dev` still uses Turbopack.

CI (`.github/workflows/ci.yml`) runs lint, typecheck, format:check,
check:content and build on every PR, each step guarded by `if: !cancelled()` so
one push surfaces every failure.

## Project Architecture

This is a Next.js 16 personal website featuring a multilingual media gallery system (music albums, movies, books) with PWA support.

### Tech Stack

- **Framework**: Next.js 16 (App Router; Turbopack in dev, webpack for builds)
- **Styling**: Tailwind CSS v4
- **Internationalization**: next-intl 4.8 (en, es, fr, it, de)
- **PWA**: Service worker with Serwist (disabled in dev, enabled in production)
- **Content**: Markdown files with gray-matter frontmatter parsing
- **Linting**: ESLint 10 with plugins composed directly in `eslint.config.mjs`
  (not `eslint-config-next`, which cannot run on ESLint 10 — see the comment there)

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
- Loaded by `loadContent(collection)` in `src/lib/content.ts`, which parses every `.md` in the directory and sorts by title
- Markdown body becomes the description
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
  - `useIntersectionObserver`: Header visibility detection
  - `useListbox`: Keyboard, focus and dismissal behaviour for the filter dropdowns
- `src/hooks/useRevealOnScroll.ts` is the single reveal-on-scroll observer, used
  by the about page, the gallery header and both filter layouts

**Theme System**

- Dark mode implemented with Tailwind's dark class strategy
- Initial theme set via inline script in `src/app/[locale]/layout.tsx` (prevents flash)
- Theme toggle in `ClientLayout` component persists to localStorage
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
- Caching via `defaultCache` from `@serwist/next/worker`:
  - **Precaching**: Static assets (JS, CSS, fonts, icons) via `self.__SW_MANIFEST`
  - **NetworkFirst**: Homepage, API routes, RSC data
  - **CacheFirst**: Static JS chunks, audio/video
  - **StaleWhileRevalidate**: Images, fonts, CSS
- Key cache stores: `serwist-precache-v2`, `next-image`, `pages-rsc-prefetch`
- `src/app/sw.ts` is excluded from the main `tsconfig.json` (Serwist compiles it independently)
- Manifest: `public/manifest.json` with icons, screenshots, protocol handlers

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
