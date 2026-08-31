import { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import withSerwistInit from '@serwist/next';

const withSerwist = withSerwistInit({
  swSrc: 'src/app/sw.ts',
  swDest: 'public/sw.js',
  disable: process.env.NODE_ENV === 'development',
});

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
    // Enable image optimization features
    formats: ['image/avif', 'image/webp'],
    // Device sizes for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    // Image sizes for different breakpoints
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Cloudinary URLs are version-pinned and immutable, so the optimized
    // output can be cached for a year rather than re-optimized every minute.
    minimumCacheTTL: 31536000,
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
              // 'unsafe-inline' is still needed for the inline theme script in
              // the document head. 'unsafe-eval' is not: a production Next build
              // does not eval.
              "script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com", // Allow Vercel Analytics
              "style-src 'self' 'unsafe-inline'", // unsafe-inline needed for Tailwind
              "img-src 'self' data: https: blob:", // Allow images from Cloudinary and data URIs
              "font-src 'self' data:",
              "connect-src 'self' https://res.cloudinary.com https://va.vercel-scripts.com https://vitals.vercel-insights.com", // Allow Vercel Analytics
              // Nothing is embedded: YouTube trailers and Spotify albums are
              // plain outbound links, not iframes. This previously also allowed
              // Cloudflare Turnstile, which the site has never used.
              "frame-src 'none'",
              "media-src 'self' https://res.cloudinary.com",
              "object-src 'none'", // Prevent Flash/Java
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'", // Prevent clickjacking
              'upgrade-insecure-requests', // Force HTTPS
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
            // Retained for pre-CSP browsers; `frame-ancestors 'none'` above is
            // the modern equivalent and takes precedence where both are read.
            key: 'X-Frame-Options',
            value: 'DENY', // Prevent clickjacking
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff', // Prevent MIME sniffing
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
export default withSerwist(withNextIntl(nextConfig));
