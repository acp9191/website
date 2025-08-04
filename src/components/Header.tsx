'use client';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useState, useRef, useEffect } from 'react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import LocaleSwitcher from './LocaleSwitcher';

export default function Header() {
  const t = useTranslations('Header');
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const menuRef = useRef<HTMLDivElement>(null);

  const links = [
    { href: '/about', label: t('about') },
    { href: '/favorites/music', label: t('music') },
    // { href: '/favorites/books', label: t('books') },
    { href: '/favorites/movies', label: t('movies') },
  ];

  // On mount, set theme from localStorage or system preference
  useEffect(() => {
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initial: 'light' | 'dark' =
      saved === 'light' || saved === 'dark' ? saved : prefersDark ? 'dark' : 'light';
    setTheme(initial);
    document.documentElement.classList.toggle('dark', initial === 'dark');
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    localStorage.setItem('theme', newTheme);
  };

  // Close menu on resize
  useEffect(() => {
    const close = () => setMenuOpen(false);
    window.addEventListener('resize', close);
    return () => window.removeEventListener('resize', close);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-xs">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link
            href="/"
            className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white transition-transform hover:scale-105 active:scale-95"
          >
            {t('title')}
          </Link>

          <button
            className="sm:hidden w-10 h-10 relative text-gray-800 dark:text-white"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label={t('toggleMenu')}
          >
            {/* Hamburger Icon */}
            <Bars3Icon
              className={`absolute inset-0 w-6 h-6 m-auto transition-opacity duration-300 ${
                menuOpen ? 'opacity-0' : 'opacity-100'
              }`}
            />
            {/* X Icon */}
            <XMarkIcon
              className={`absolute inset-0 w-6 h-6 m-auto transition-opacity duration-300 ${
                menuOpen ? 'opacity-100' : 'opacity-0'
              }`}
            />
          </button>

          {/* Desktop nav */}
          <nav className="hidden sm:flex gap-4 text-sm sm:text-base items-center">
            {links.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="px-3 py-1 rounded-full text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
              >
                {label}
              </Link>
            ))}
            <button
              onClick={toggleTheme}
              className="px-3 py-1 rounded-full text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 cursor-pointer"
            >
              {theme === 'dark' ? t('lightMode') : t('darkMode')}
            </button>

            <LocaleSwitcher />
          </nav>
        </div>

        {/* Mobile nav */}
        <div
          ref={menuRef}
          className={`overflow-hidden transition-all duration-300 ease-in-out sm:hidden ${
            menuOpen ? 'max-h-96' : 'max-h-0'
          }`}
        >
          <nav className="flex flex-col gap-2 py-2">
            {links.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-2 rounded-md text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
              >
                {label}
              </Link>
            ))}
            <button
              onClick={toggleTheme}
              className="block w-full px-4 py-2 rounded-md text-left text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition cursor-pointer"
            >
              {theme === 'dark' ? t('lightMode') : t('darkMode')}
            </button>

            {/* Mobile-specific locale switcher wrapper */}
            <div className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-md">
              <div className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-200 text-sm font-medium">
                  {t('language')}
                </span>
                <LocaleSwitcher isMobile onLocaleChange={() => setMenuOpen(false)} />
              </div>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
