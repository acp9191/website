import { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withPWA = require('next-pwa')({
  dest: 'public',
  register: false,
  skipWaiting: true,
  // Optional: keep SW off in dev to avoid caching headaches
  disable: process.env.NODE_ENV === 'development',
  buildExcludes: [/app-build-manifest\.json$/],
  publicExcludes: ['!robots.txt', '!sitemap.xml'],
});

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // unsafe-inline needed for Next.js, unsafe-eval for dev
              "style-src 'self' 'unsafe-inline'", // unsafe-inline needed for Tailwind
              "img-src 'self' data: https: blob:", // Allow images from Cloudinary and data URIs
              "font-src 'self' data:",
              "connect-src 'self' https://res.cloudinary.com", // API calls
              "frame-src 'self' https://www.youtube.com https://open.spotify.com", // Embedded content
              "media-src 'self' https://res.cloudinary.com",
              "object-src 'none'", // Prevent Flash/Java
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'", // Prevent clickjacking
              "upgrade-insecure-requests", // Force HTTPS
            ].join('; '),
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY', // Prevent clickjacking
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff', // Prevent MIME sniffing
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block', // Legacy XSS protection
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()', // Disable unnecessary features
          },
        ],
      },
    ];
  },
};

const withNextIntl = createNextIntlPlugin();
export default withPWA(withNextIntl(nextConfig));
