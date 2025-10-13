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
};

const withNextIntl = createNextIntlPlugin();
export default withPWA(withNextIntl(nextConfig));
