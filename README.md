# Avery Peterson - Personal Website

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8)](https://tailwindcss.com/)

A modern, multilingual personal website featuring a Progressive Web App (PWA) with offline support, built with Next.js 16 and Tailwind CSS v4.

🔗 **[Live Site](https://avery-peterson.com)** | 📱 **Installable as PWA** | ♿ **Fully Accessible**

## ✨ Features

### 🌍 Internationalization

- **5 languages supported**: English, Spanish, French, Italian, German
- Automatic locale detection based on browser preferences
- Language switcher in header
- Localized routes with `/[locale]` dynamic segments
- Powered by `next-intl`

### 🎵 Media Galleries

Three fully-featured galleries for showcasing favorites:

- **Music Albums** - Albums with Spotify integration
- **Movies** - Films with trailer links
- **Books** - Reading list with categories

**Gallery Features:**

- Advanced multi-dimensional filtering (category/genre, artist/director/author, year)
- Responsive grid layout
- Markdown content support with frontmatter
- Cloudinary-hosted images with Next.js Image optimization

### 📱 Progressive Web App (PWA)

- **Offline support** - Works without internet after first visit
- **Installable** - Add to home screen on mobile/desktop
- **Smart caching** - Automatic caching with Serwist (static assets, images, pages)
- **Window controls overlay** for native app experience on desktop
- **Protocol handlers** for custom URL schemes (`web+avery://`)
- **App manifest** with screenshots for rich install UI

### 🎨 Theme System

- **Dark mode** with automatic detection
- Persists user preference to localStorage
- Flash-free loading with inline theme script
- Tailwind CSS dark mode support

### ♿ Accessibility

- **Built against WCAG 2.1 AA** - targets Level AA; not independently audited
- **Semantic HTML** - Proper landmark regions (header, main, nav, footer)
- **ARIA attributes** - Comprehensive labeling for assistive technologies
- **Keyboard navigation** - Full site navigation without mouse
- **Screen reader friendly** - Decorative icons hidden from screen readers
- **Focus management** - Clear focus indicators and logical tab order
- **Color contrast** - Aims for WCAG AA contrast in both light and dark modes
- **Reduced motion** - `prefers-reduced-motion` collapses every animation, stagger and smooth scroll

### 🛡️ Security

- **Content Security Policy (CSP)** - Prevents XSS attacks
- **Security headers** - HSTS, X-Frame-Options, X-Content-Type-Options
- **HTTPS enforcement** - Upgrade insecure requests
- **Privacy-focused** - No tracking cookies, minimal data collection
- **Regular updates** - Dependabot keeps dependencies secure

### 🔧 Developer Experience

- **TypeScript** for type safety
- **Tailwind CSS v4** for styling
- **Next.js 16 App Router** with server components (Turbopack in dev)
- **Automatic dependency updates** via Dependabot
- **Content-driven** - Markdown files with YAML frontmatter
- **Path aliases** (`@/`) for clean imports
- **CI on every PR** - lint, types, formatting, content validation and a full build

## 🚀 Getting Started

### Prerequisites

- Node.js 24 (see `.nvmrc`; `engines.node` pins the same major)
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/acp9191/website.git
cd avery-site

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

### Available Scripts

```bash
npm run dev           # Start development server (PWA disabled)
npm run build         # Build for production (PWA enabled, type-checked)
npm start             # Start production server
npm run lint          # ESLint
npm run typecheck     # tsc --noEmit
npm run format        # Prettier, writing changes
npm run format:check  # Prettier, failing instead of writing
npm run check:content # Validate content frontmatter and genre spellings
```

`build` passes `--webpack` deliberately: Serwist's service-worker compilation
does not run under Turbopack. `next dev` is unaffected and still uses Turbopack.

## 📁 Project Structure

```
avery-site/
├── content/               # Markdown content files
│   ├── albums/           # Music albums
│   ├── movies/           # Movie reviews
│   └── books/            # Book list
├── messages/             # Translation files (en.json, es.json, etc.)
├── public/
│   ├── favicons/         # App icons
│   ├── icons/            # Social media icons
│   ├── screenshots/      # PWA screenshots
│   ├── manifest.json     # PWA manifest
│   └── sw.js             # Service worker (generated)
├── src/
│   ├── app/
│   │   └── [locale]/     # Localized routes
│   ├── components/
│   │   ├── MediaGallery/ # Reusable gallery system
│   │   ├── Header.tsx    # Site header with nav
│   │   ├── Footer.tsx    # Site footer
│   │   └── ClientLayout.tsx # Theme provider
│   ├── i18n/
│   │   └── routing.ts    # Locale configuration
│   └── proxy.ts          # Next.js proxy for i18n routing
├── scripts/
│   └── check-content.mjs # Frontmatter + genre validation (runs in CI)
├── .github/
│   ├── workflows/ci.yml  # Lint, types, format, content, build on every PR
│   └── dependabot.yml    # Automatic dependency updates
└── next.config.ts        # Next.js + PWA configuration
```

## 📝 Adding Content

### Music Albums

Create a new file in `content/albums/album-name.md`:

```markdown
---
title: 'Album Title'
artist: 'Artist Name'
cover: 'https://res.cloudinary.com/acp/image/upload/...'
year: 2024
genres: ['Rock', 'Alternative']
spotify: 'spotify:album:...'
---

Your album description here in Markdown.
```

### Movies

Create a new file in `content/movies/movie-name.md`:

```markdown
---
title: 'Movie Title'
director: 'Director Name'
poster: 'https://res.cloudinary.com/acp/image/upload/...'
year: 2024
genres: ['Drama', 'Thriller']
trailer: 'https://youtube.com/watch?v=...'
---

Your movie review here.
```

Note the image field: movies use `poster`, albums and books use `cover`.
`npm run check:content` catches it when they are mixed up.

### Books

Create a new file in `content/books/book-name.md`:

```markdown
---
title: 'Book Title'
author: 'Author Name'
cover: 'https://res.cloudinary.com/acp/image/upload/...'
year: 2024
genres: ['Fiction', 'Science Fiction']
---

Your book notes here.
```

## 🌐 Adding Translations

Edit the JSON files in `messages/`:

```json
// messages/en.json
{
  "Header": {
    "home": "Home",
    "about": "About"
  },
  "Gallery": {
    "genre": "Genre"
  },
  "Music": {
    "title": "Favorite Albums",
    "artist": "Artist"
  }
}
```

Labels shared by all three galleries (genre, year, reset, scroll-to-top,
"filter by") live in the `Gallery` namespace rather than being repeated in
`Music`, `Movies` and `Books`. The `all` sentinel is deliberately _not_ shared:
in gendered languages it agrees with the noun it stands in for (Spanish uses
"Todas" for películas but "Todos" for álbumes).

## 🎯 PWA Configuration

The PWA is configured in `next.config.ts` with service worker generation disabled in development mode.

### Testing PWA Offline

1. Build for production: `npm run build`
2. Start production server: `npm start`
3. Open DevTools → **Application** → **Service Workers** (should show "activated")
4. Browse a few pages, then enable **Network** → **Offline** mode
5. Refresh - site should work offline!

## 🔒 Environment Variables

No environment variables required! All configuration is in the codebase.

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

**Important**: PWA features (offline mode, protocol handlers) require HTTPS to work properly.

## 📦 Tech Stack

| Technology          | Purpose                                       |
| ------------------- | --------------------------------------------- |
| **Next.js 16**      | React framework with App Router and Turbopack |
| **React 19**        | UI library                                    |
| **TypeScript 6**    | Type safety                                   |
| **Tailwind CSS v4** | Styling                                       |
| **next-intl 4.14**  | Internationalization                          |
| **Serwist**         | Progressive Web App caching strategies        |
| **gray-matter**     | Markdown frontmatter parsing                  |
| **Heroicons**       | Icon library                                  |
| **Cloudinary**      | Image hosting and optimization                |

## 🤖 Automation

- **Dependabot** - Automatic dependency updates every Monday
- **Service Worker** - Auto-generated on build with Serwist
- **Type Checking** - Runs during production builds

### Continuous Integration

`.github/workflows/ci.yml` runs on every pull request. Each step runs even when
an earlier one fails, so a single push reports every problem at once:

| Step      | Command                 |
| --------- | ----------------------- |
| Lint      | `npm run lint`          |
| Typecheck | `npm run typecheck`     |
| Format    | `npm run format:check`  |
| Content   | `npm run check:content` |
| Build     | `npm run build`         |

The build step is not redundant with the other four: the Serwist service-worker
compile and the prerender of all 28 localized pages only happen there.

## 🐛 Troubleshooting

### Service Worker Not Registering

- Ensure you're running `npm start` (production mode)
- PWA is disabled in development by design
- Hard refresh: `Cmd/Ctrl + Shift + R`

### Offline Mode Not Working

- Visit pages while online first to cache them
- Check DevTools → Application → Cache Storage
- Verify service worker is "activated and running"

### Build Errors

- Clear `.next` folder: `rm -rf .next`
- Delete node_modules: `rm -rf node_modules && npm install`
- Check TypeScript errors: `npx tsc --noEmit`

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 👤 Author

**Avery Peterson**

- Website: [avery-peterson.com](https://avery-peterson.com)
- GitHub: [@acp9191](https://github.com/acp9191)

---

Built with ❤️ using Next.js and modern web technologies.
