'use client';
import { useTranslations } from 'next-intl';

export default function Footer() {
  const t = useTranslations('Footer');

  return (
    <footer className="text-center text-sm text-gray-500 dark:text-gray-400 mt-8 space-y-2">
      <div className="flex justify-center gap-4 mb-2">
        <a
          href="https://github.com/yourusername"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub"
          className="hover:opacity-75 transition-opacity"
        >
          <img src="/icons/github.svg" alt="GitHub" className="w-5 h-5 dark:invert" />
        </a>
        <a
          href="https://twitter.com/yourusername"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Twitter"
          className="hover:opacity-75 transition-opacity"
        >
          <img src="/icons/spotify.svg" alt="Spotify" className="w-5 h-5" />
        </a>
        <a
          href="https://linkedin.com/in/yourusername"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn"
          className="hover:opacity-75 transition-opacity"
        >
          <img src="/icons/linkedin.png" alt="LinkedIn" className="w-5 h-5" />
        </a>
        <a
          href="https://linkedin.com/in/yourusername"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
          className="hover:opacity-75 transition-opacity"
        >
          <img src="/icons/instagram.svg" alt="Instagram" className="w-5 h-5" />
        </a>
      </div>
      <p>{t('copyright', { year: new Date().getFullYear() })}</p>
    </footer>
  );
}
