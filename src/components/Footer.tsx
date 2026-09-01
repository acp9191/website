'use client';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';
import clsx from 'clsx';

/**
 * `invertInDark` is for the monochrome marks only — inverting a brand colour
 * (Spotify green, Instagram's gradient, the LinkedIn blue) would misrender it.
 */
const SOCIAL_LINKS = [
  {
    href: 'https://github.com/acp9191',
    label: 'GitHub',
    icon: '/icons/github.svg',
    invertInDark: true,
  },
  {
    href: 'https://open.spotify.com/user/acp9191',
    label: 'Spotify',
    icon: '/icons/spotify.svg',
    invertInDark: false,
  },
  {
    href: 'https://linkedin.com/in/acp',
    label: 'LinkedIn',
    icon: '/icons/linkedin.png',
    invertInDark: false,
  },
  {
    href: 'https://www.instagram.com/acp.jpg',
    label: 'Instagram',
    icon: '/icons/instagram.svg',
    invertInDark: false,
  },
  { href: 'https://x.com/acp9191', label: 'X', icon: '/icons/x.svg', invertInDark: true },
] as const;

/**
 * One of the three product links inside the "built with" sentence.
 *
 * That sentence used to be assembled from three fragments — "Built with",
 * ", styled with", ", deployed via" — which hard-coded English clause order
 * into every locale. It is now a single translatable string with the links
 * marked up inside it, so a translator can reorder the whole thing.
 */
const footerLink = (href: string) => (chunks: ReactNode) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors underline"
  >
    {chunks}
  </a>
);

export default function Footer() {
  const t = useTranslations('Footer');

  return (
    <footer className="text-center text-sm text-gray-500 dark:text-gray-400 mt-8 space-y-4 py-3">
      <div className="flex justify-center gap-4 mb-4">
        {SOCIAL_LINKS.map(({ href, label, icon, invertInDark }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            className="hover:opacity-75 transition-opacity"
          >
            <Image
              src={icon}
              alt={label}
              width={20}
              height={20}
              className={clsx('w-5 h-5', invertInDark && 'dark:invert')}
            />
          </a>
        ))}
      </div>

      <div className="space-y-2">
        <p className="text-xs text-gray-400 dark:text-gray-500">
          {t.rich('builtWith', {
            nextjs: footerLink('https://nextjs.org'),
            tailwind: footerLink('https://tailwindcss.com'),
            vercel: footerLink('https://vercel.com'),
          })}
        </p>
        <p>{t('copyright', { year: new Date().getFullYear() })}</p>
      </div>
    </footer>
  );
}
