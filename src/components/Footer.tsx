'use client';
import { useTranslations } from 'next-intl';

export default function Footer() {
  const t = useTranslations('Footer');

  return (
    <footer className="text-center text-sm text-gray-500 dark:text-gray-400 mt-8 space-y-4 py-3" role="contentinfo">
      <div className="flex justify-center gap-4 mb-4">
        <a
          href="https://github.com/acp9191"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub"
          className="hover:opacity-75 transition-opacity"
        >
          <img src="/icons/github.svg" alt="GitHub" className="w-5 h-5 dark:invert" />
        </a>
        <a
          href="https://open.spotify.com/user/acp9191"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Spotify"
          className="hover:opacity-75 transition-opacity"
        >
          <img src="/icons/spotify.svg" alt="Spotify" className="w-5 h-5" />
        </a>
        <a
          href="https://linkedin.com/in/acp"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn"
          className="hover:opacity-75 transition-opacity"
        >
          <img src="/icons/linkedin.png" alt="LinkedIn" className="w-5 h-5" />
        </a>
        <a
          href="https://www.instagram.com/acp.jpg"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
          className="hover:opacity-75 transition-opacity"
        >
          <img src="/icons/instagram.svg" alt="Instagram" className="w-5 h-5" />
        </a>
        <a
          href="https://x.com/acp9191"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="X"
          className="hover:opacity-75 transition-opacity"
        >
          <img src="/icons/x.svg" alt="X" className="w-5 h-5 dark:invert" />
        </a>
      </div>

      <div className="space-y-2">
        <p className="text-xs text-gray-400 dark:text-gray-500">
          {t('builtWith')}{' '}
          <a
            href="https://nextjs.org"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors underline"
          >
            Next.js
          </a>
          {t('styledWith')}{' '}
          <a
            href="https://tailwindcss.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors underline"
          >
            Tailwind CSS
          </a>
          {t('deployedVia')}{' '}
          <a
            href="https://vercel.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors underline"
          >
            Vercel
          </a>
        </p>
        <p>{t('copyright', { year: new Date().getFullYear() })}</p>
      </div>
    </footer>
  );
}
