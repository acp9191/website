'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState, useRef, useEffect } from 'react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import LocaleSwitcher from './LocaleSwitcher';

export default function Header() {
  const t = useTranslations('Header');
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const links = [
    { href: '/about', label: t('about') },
    { href: '/favorites/music', label: t('music') },
    { href: '/favorites/books', label: t('books') },
    { href: '/favorites/movies', label: t('movies') },
  ];

  // Helper function to check if a link is active
  const isActiveLink = (href: string) => {
    // Remove locale prefix for comparison (e.g., /en/about -> /about)
    const cleanPathname = pathname.replace(/^\/[a-z]{2}(?=\/|$)/, '') || '/';
    const cleanHref = href;

    // Exact match for most pages
    if (cleanHref === cleanPathname) return true;

    // Special case for favorites pages - highlight parent when on subpages
    if (cleanHref === '/favorites/music' && cleanPathname.startsWith('/favorites/music'))
      return true;
    if (cleanHref === '/favorites/books' && cleanPathname.startsWith('/favorites/books'))
      return true;
    if (cleanHref === '/favorites/movies' && cleanPathname.startsWith('/favorites/movies'))
      return true;

    return false;
  };

  // Only run on client side after hydration
  useEffect(() => {
    setMounted(true);
    // Read theme from localStorage first, then from DOM as fallback
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || savedTheme === 'light') {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    } else {
      // Fallback to system preference or DOM state
      const isDark = document.documentElement.classList.contains('dark');
      setTheme(isDark ? 'dark' : 'light');
    }
  }, []);

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setScrolled(scrollY > 20); // Trigger after 20px of scroll
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
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

  const ThemeToggle = ({ isMobile = false }: { isMobile?: boolean }) => (
    <button
      onClick={toggleTheme}
      className={`${
        isMobile
          ? 'flex items-center justify-center'
          : `flex items-center justify-center px-3 py-1 rounded-full text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 ${
              scrolled ? 'scale-90' : 'scale-100'
            }`
      } cursor-pointer`}
      aria-label={t('toggleTheme')}
    >
      <div className="relative">
        {/* Toggle Switch */}
        <div
          className={`${
            scrolled ? 'w-10 h-5' : 'w-12 h-6'
          } rounded-full transition-all duration-500 ease-in-out ${
            theme === 'dark' ? 'bg-blue-600' : 'bg-gray-300'
          }`}
        >
          {/* Toggle Button */}
          <div
            className={`absolute ${
              scrolled ? 'top-0.5 w-4 h-4' : 'top-0.5 w-5 h-5'
            } rounded-full bg-white shadow-lg transition-all duration-500 ease-in-out ${
              theme === 'dark' ? (scrolled ? 'translate-x-5' : 'translate-x-6') : 'translate-x-0.5'
            }`}
          />
        </div>
      </div>
    </button>
  );

  return (
    <header
      role="banner"
      className={`sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 transition-all duration-300 ease-out ${
        scrolled ? 'shadow-md backdrop-blur-sm bg-white/95 dark:bg-gray-900/95' : 'shadow-xs'
      }`}
    >
      <div className="max-w-5xl mx-auto px-4">
        <div
          className={`flex items-center justify-between transition-all duration-300 ease-out ${
            scrolled ? 'h-12' : 'h-16'
          }`}
        >
          <Link
            href="/"
            className={`font-semibold text-gray-900 dark:text-white transition-all duration-300 hover:scale-105 active:scale-95 ${
              scrolled ? 'text-base sm:text-lg' : 'text-lg sm:text-xl'
            }`}
          >
            {t('title')}
          </Link>

          <button
            className={`sm:hidden relative text-gray-800 dark:text-white transition-all duration-300 ${
              scrolled ? 'w-8 h-8' : 'w-10 h-10'
            }`}
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label={t('toggleMenu')}
          >
            {/* Hamburger Icon */}
            <Bars3Icon
              className={`absolute inset-0 m-auto transition-all duration-300 ease-out ${
                scrolled ? 'w-5 h-5' : 'w-6 h-6'
              } ${menuOpen ? 'opacity-0 rotate-45' : 'opacity-100 rotate-0'}`}
            />
            {/* X Icon */}
            <XMarkIcon
              className={`absolute inset-0 m-auto transition-all duration-300 ease-out ${
                scrolled ? 'w-5 h-5' : 'w-6 h-6'
              } ${menuOpen ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-45'}`}
            />
          </button>

          {/* Desktop nav */}
          <nav className="hidden sm:flex gap-4 items-center" role="navigation" aria-label="Main navigation">
            {links.map(({ href, label }) => {
              const isActive = isActiveLink(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`relative px-3 py-1 rounded-full transition-all duration-300 hover:scale-110 hover:shadow-lg group overflow-hidden ${
                    scrolled ? 'text-xs sm:text-sm' : 'text-sm sm:text-base'
                  } ${
                    isActive
                      ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                      : 'text-gray-700 dark:text-gray-200'
                  }`}
                >
                  {/* Shimmer effect - only for non-active links */}
                  {!isActive && (
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
                  )}

                  {/* Active indicator dot */}
                  {isActive && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 dark:bg-blue-400 rounded-full" />
                  )}

                  {/* Text with bounce */}
                  <span className="relative block font-medium">{label}</span>
                </Link>
              );
            })}
            <ThemeToggle />
            <div className={`transition-all duration-300 ${scrolled ? 'scale-90' : 'scale-100'}`}>
              <LocaleSwitcher />
            </div>
          </nav>
        </div>

        {/* Mobile nav - improved animation */}
        <div className="sm:hidden overflow-hidden">
          <div
            ref={menuRef}
            className={`transition-all duration-300 ease-out ${
              menuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <nav className="flex flex-col gap-2 py-4" role="navigation" aria-label="Mobile navigation">
              {links.map(({ href, label }, index) => {
                const isActive = isActiveLink(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMenuOpen(false)}
                    className={`relative block px-4 py-3 rounded-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-md group overflow-hidden transform ${
                      menuOpen ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'
                    } ${
                      isActive
                        ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 font-medium'
                        : 'text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-800'
                    }`}
                    style={{
                      transitionDelay: menuOpen ? `${index * 50}ms` : '0ms',
                      transitionDuration: '400ms',
                    }}
                  >
                    {/* Mobile shimmer effect - only for non-active */}
                    {!isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
                    )}

                    {/* Active indicator */}
                    {isActive && (
                      <div className="absolute left-2 top-1/2 transform -translate-y-1/2 w-1 h-4 bg-blue-600 dark:bg-blue-400 rounded-full" />
                    )}

                    <span className={`relative ${isActive ? 'ml-2' : ''}`}>{label}</span>
                  </Link>
                );
              })}

              {/* Theme toggle with staggered animation */}
              <div
                className={`px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-lg transform transition-all duration-400 ${
                  menuOpen ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'
                }`}
                style={{
                  transitionDelay: menuOpen ? `${links.length * 50}ms` : '0ms',
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 dark:text-gray-200 text-sm font-medium">
                    {t('theme')}
                  </span>
                  <ThemeToggle isMobile />
                </div>
              </div>

              {/* Language switcher with staggered animation */}
              <div
                className={`px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-lg transform transition-all duration-400 ${
                  menuOpen ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'
                }`}
                style={{
                  transitionDelay: menuOpen ? `${(links.length + 1) * 50}ms` : '0ms',
                }}
              >
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
      </div>
    </header>
  );
}
