# Avery Peterson - Personal Website

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
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
- Modal image viewer
- Markdown content support with frontmatter
- Cloudinary-hosted images with Next.js Image optimization

### 📱 Progressive Web App (PWA)

- **Offline support** - Full functionality without internet
- **Installable** - Add to home screen on mobile/desktop
- **Service worker** caching with Workbox strategies
- **Window controls overlay** for native app experience on desktop
- **Protocol handlers** for custom URL schemes (`web+avery://`)
- **App manifest** with screenshots for rich install UI

### 🎨 Theme System

- **Dark mode** with automatic detection
- Persists user preference to localStorage
- Flash-free loading with inline theme script
- Tailwind CSS dark mode support

### ♿ Accessibility

- **WCAG 2.1 compliant** - Meets Level AA standards
- **Semantic HTML** - Proper landmark regions (header, main, nav, footer)
- **ARIA attributes** - Comprehensive labeling for assistive technologies
- **Keyboard navigation** - Full site navigation without mouse
- **Screen reader friendly** - Decorative icons hidden from screen readers
- **Focus management** - Clear focus indicators and logical tab order
- **Modals** - Keyboard accessible with Escape key support
- **Color contrast** - Meets WCAG contrast requirements in both light and dark modes

### 🛡️ Security

- **Content Security Policy (CSP)** - Prevents XSS attacks
- **Security headers** - HSTS, X-Frame-Options, X-Content-Type-Options
- **HTTPS enforcement** - Upgrade insecure requests
- **Privacy-focused** - No tracking cookies, minimal data collection
- **Regular updates** - Dependabot keeps dependencies secure

### 🔧 Developer Experience

- **TypeScript** for type safety
- **Tailwind CSS v4** for styling
- **Next.js 16 App Router** with server components and Turbopack
- **Automatic dependency updates** via Dependabot
- **Content-driven** - Markdown files with YAML frontmatter
- **Path aliases** (`@/`) for clean imports

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

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
npm run dev    # Start development server (PWA disabled)
npm run build  # Build for production
npm start      # Start production server (PWA enabled)
```

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
├── .github/
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
cover: 'https://res.cloudinary.com/acp/image/upload/...'
year: 2024
genres: ['Drama', 'Thriller']
trailer: 'https://youtube.com/watch?v=...'
---

Your movie review here.
```

### Books

Create a new file in `content/books/book-name.md`:

```markdown
---
title: 'Book Title'
author: 'Author Name'
cover: 'https://res.cloudinary.com/acp/image/upload/...'
year: 2024
categories: ['Fiction', 'Science Fiction']
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
  "Music": {
    "title": "Favorite Albums"
  }
}
```

## 🎯 PWA Configuration

The PWA is configured in `next.config.ts`:

```typescript
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  buildExcludes: [/app-build-manifest\.json$/],
});
```

### Testing PWA Offline

1. Build for production: `npm run build`
2. Start production server: `npm start`
3. Visit the site and browse pages
4. In DevTools Network tab, check "Offline"
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

| Technology          | Purpose                         |
| ------------------- | ------------------------------- |
| **Next.js 16**      | React framework with App Router and Turbopack |
| **React 19**        | UI library                      |
| **TypeScript 5**    | Type safety                     |
| **Tailwind CSS v4** | Styling                         |
| **next-intl 4.4**   | Internationalization            |
| **next-pwa**        | Progressive Web App support     |
| **gray-matter**     | Markdown frontmatter parsing    |
| **Headless UI**     | Accessible UI components        |
| **Hero Icons**      | Icon library                    |
| **Cloudinary**      | Image hosting and optimization  |

## 🤖 Automation

- **Dependabot** - Automatic dependency updates every Monday
- **Service Worker** - Auto-generated on build with Workbox
- **Type Checking** - Runs during production builds

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

- Website: [avery-peterson.com](https://your-domain.com)
- GitHub: [@your-username](https://github.com/acp9191)

---

Built with ❤️ using Next.js and modern web technologies.
