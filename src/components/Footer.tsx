'use client';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

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
        <a
          href="https://github.com/acp9191"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub"
          className="hover:opacity-75 transition-opacity"
        >
          <Image
            src="/icons/github.svg"
            alt="GitHub"
            width={20}
            height={20}
            className="w-5 h-5 dark:invert"
          />
        </a>
        <a
          href="https://open.spotify.com/user/acp9191"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Spotify"
          className="hover:opacity-75 transition-opacity"
        >
          <Image
            src="/icons/spotify.svg"
            alt="Spotify"
            width={20}
            height={20}
            className="w-5 h-5"
          />
        </a>
        <a
          href="https://linkedin.com/in/acp"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn"
          className="hover:opacity-75 transition-opacity"
        >
          <Image
            src="/icons/linkedin.png"
            alt="LinkedIn"
            width={20}
            height={20}
            className="w-5 h-5"
          />
        </a>
        <a
          href="https://www.instagram.com/acp.jpg"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
          className="hover:opacity-75 transition-opacity"
        >
          <Image
            src="/icons/instagram.svg"
            alt="Instagram"
            width={20}
            height={20}
            className="w-5 h-5"
          />
        </a>
        <a
          href="https://x.com/acp9191"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="X"
          className="hover:opacity-75 transition-opacity"
        >
          <Image
            src="/icons/x.svg"
            alt="X"
            width={20}
            height={20}
            className="w-5 h-5 dark:invert"
          />
        </a>
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
