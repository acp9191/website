# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
npm run dev    # Start development server on http://localhost:3000
npm run build  # Build for production (includes type checking)
npm start      # Start production server
```

## Project Architecture

This is a Next.js 16 personal website featuring a multilingual media gallery system (music albums, movies, books) with PWA support.

### Tech Stack

- **Framework**: Next.js 16 (App Router with Turbopack)
- **Styling**: Tailwind CSS v4
- **Internationalization**: next-intl 4.4 (en, es, fr, it, de)
- **PWA**: Service worker with Workbox (disabled in dev, enabled in production)
- **Content**: Markdown files with gray-matter frontmatter parsing

### Key Architectural Patterns

**Internationalized Routing**

- All routes are under `src/app/[locale]/` dynamic segment
- Proxy (`src/proxy.ts`) handles locale detection and routing (Next.js 16 convention)
- Locale configuration in `src/i18n/routing.ts` with 5 supported languages
- Translation files in `messages/*.json` (one per locale)
- Path alias `@/*` maps to root directory

**Content Management**

- Content stored as Markdown files in `content/{albums,movies,books}/`
- Each file has YAML frontmatter (title, artist/author/director, cover URL, year, genres/categories, optional external links)
- Markdown body becomes the description
- Server components read files at build/request time using `fs/promises` and `gray-matter`

**Media Gallery System**

- Reusable `MediaGallery` component (`src/components/MediaGallery/`) powers all three galleries
- Three specialized page components: `MusicGallery.tsx`, `MovieGallery.tsx`, `BookGallery.tsx`
- Each page loads its content directory, transforms to `MediaItem[]`, and renders `MediaGallery`
- Filtering system with three dimensions (category/genre, subtitle/artist/director/author, year)
- Responsive design with separate desktop/mobile filter layouts
- Custom hooks in `src/components/MediaGallery/hooks/`:
  - `useMediaGalleryFilters`: Filter state management
  - `useIntersectionObserver`: Header visibility detection
  - `useModal`: Image modal state

**Theme System**

- Dark mode implemented with Tailwind's dark class strategy
- Initial theme set via inline script in `src/app/[locale]/layout.tsx` (prevents flash)
- Theme toggle in `ClientLayout` component persists to localStorage
- PWA theme-color meta tags respect user's color scheme preference

**Image Hosting**

- All media covers hosted on Cloudinary (`res.cloudinary.com/acp`)
- Next.js Image component configured for Cloudinary domain in `next.config.ts`

**PWA Architecture**

- Service worker: `public/sw.js` (generated at build using Workbox)
- Config: `next.config.ts` with PWA disabled in dev mode
- Service worker calls `skipWaiting()` and `clientsClaim()` for immediate activation
- Caching strategies:
  - **Precaching**: Static assets (JS, CSS, fonts, icons)
  - **NetworkFirst**: Homepage, API routes, RSC data
  - **CacheFirst**: Static JS chunks, audio/video
  - **StaleWhileRevalidate**: Images, fonts, CSS
- Key cache stores: `workbox-precache-v2`, `next-image`, `pages-rsc-prefetch`
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
   - Movies: `title`, `director`, `cover`, `year`, `genres`, optional `trailer`
   - Books: `title`, `author`, `cover`, `year`, `categories`
3. Add description in markdown body
4. Content auto-loads on next build/page request

### Localization Workflow

- Update `messages/{locale}.json` files when adding UI text
- Each gallery has its own translation namespace (Music, Movies, Books)
- Component props accept `translationNamespace` to scope translations
- Header/Footer translations in respective namespaces

### Build Notes

- TypeScript strict mode is disabled (`tsconfig.json`)
- Service worker generated in `public/sw.js` during production build
- Sitemap generated at `/sitemap.xml` via route handler in `src/app/sitemap.xml/route.ts`
- PWA features only work in production mode (`npm start`), not development (`npm run dev`)

### Testing PWA

```bash
npm run build && npm start
```

- DevTools → Application → Service Workers (should show "activated")
- DevTools → Cache Storage (should show workbox caches)
- Console: `!!navigator.serviceWorker.controller` (should be true)
- Test offline: Browse pages, enable Network offline mode, refresh
