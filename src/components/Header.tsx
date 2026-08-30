'use client';
import { Link, usePathname } from '@/src/i18n/navigation';
import { useTranslations } from 'next-intl';
import { useState, useRef, useEffect } from 'react';
import { Bars3Icon, XMarkIcon, SunIcon, MoonIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline';
import LocaleSwitcher from './LocaleSwitcher';

/**
 * Renders identically on server and client — which icon is visible is decided in
 * CSS from the `data-theme` attribute the inline head script sets before first
 * paint. Gating this on a `mounted` flag instead made the control pop in after
 * hydration, which read as a flash on a hard refresh.
 *
 * Defined at module scope rather than inside Header: a component created during
 * render is a new type on every render, so React unmounts and remounts its
 * subtree each time, discarding state and re-running effects.
 */
function ThemeToggle({
  isMobile = false,
  scrolled,
  label,
  onToggle,
}: {
  isMobile?: boolean;
  scrolled: boolean;
  label: string;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className={`${
        isMobile
          ? 'flex items-center justify-center'
          : `flex items-center justify-center p-2 rounded-full text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 ${
              scrolled ? 'scale-90' : 'scale-100'
            }`
      } cursor-pointer`}
      aria-label={label}
    >
      <div className={`relative ${isMobile ? 'w-5 h-5' : scrolled ? 'w-5 h-5' : 'w-6 h-6'}`}>
        {/* Sun Icon (light mode) */}
        <SunIcon className="w-full h-full absolute inset-0 theme-icon theme-icon-light" />
        {/* Moon Icon (dark mode) */}
        <MoonIcon className="w-full h-full absolute inset-0 theme-icon theme-icon-dark" />
        {/* Computer Icon (system theme) */}
        <ComputerDesktopIcon className="w-full h-full absolute inset-0 theme-icon theme-icon-system" />
      </div>
    </button>
  );
}

export default function Header() {
  const t = useTranslations('Header');
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(() => {
    // Initialize from localStorage immediately
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null;
      return savedTheme || 'system';
    }
    return 'system';
  });
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // The inline script in the document head already applied the `dark` class and
  // the `data-theme` attribute before first paint, and the state initializer
  // above reads the same value from localStorage, so there is nothing to
  // re-apply on mount.

  // Listen for system theme changes when in system mode
  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      document.documentElement.classList.toggle('dark', e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const links = [
    { href: '/about', label: t('about') },
    { href: '/favorites/music', label: t('music') },
    { href: '/favorites/books', label: t('books') },
    { href: '/favorites/movies', label: t('movies') },
  ];

  // `usePathname` from the i18n navigation wrappers already returns a
  // locale-free pathname, so href and pathname compare directly. A prefix
  // match keeps the parent link highlighted on any subpage.
  const isActiveLink = (href: string) => pathname === href || pathname.startsWith(`${href}/`);


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
    // Cycle through: light → dark → system
    let newTheme: 'light' | 'dark' | 'system';
    if (theme === 'light') {
      newTheme = 'dark';
    } else if (theme === 'dark') {
      newTheme = 'system';
    } else {
      newTheme = 'light';
    }

    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);

    // Keep the attribute in sync so the CSS shows the matching icon.
    document.documentElement.dataset.theme = newTheme;

    // Apply the actual dark mode based on the new theme
    if (newTheme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.toggle('dark', prefersDark);
    } else {
      document.documentElement.classList.toggle('dark', newTheme === 'dark');
    }
  };

  // Close menu on resize
  useEffect(() => {
    const close = () => setMenuOpen(false);
    window.addEventListener('resize', close);
    return () => window.removeEventListener('resize', close);
  }, []);

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
            <ThemeToggle scrolled={scrolled} label={t('toggleTheme')} onToggle={toggleTheme} />
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
                  <ThemeToggle isMobile scrolled={scrolled} label={t('toggleTheme')} onToggle={toggleTheme} />
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
