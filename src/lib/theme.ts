export type Theme = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'theme';

/** Anything unrecognised — a stale or hand-edited value — means 'system'. */
export function normalizeTheme(value: string | null | undefined): Theme {
  return value === 'dark' || value === 'light' || value === 'system' ? value : 'system';
}

export function readStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'system';
  try {
    return normalizeTheme(localStorage.getItem(STORAGE_KEY));
  } catch {
    return 'system';
  }
}

export function storeTheme(theme: Theme): void {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Private mode or blocked storage: the theme still applies for this page.
  }
}

/**
 * Writes the theme to <html>: the `dark` class Tailwind's variant keys off, and
 * `data-theme`, which the toggle's icon is resolved from in CSS.
 */
export function applyTheme(theme: Theme): void {
  const isDark =
    theme === 'system'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
      : theme === 'dark';

  document.documentElement.classList.toggle('dark', isDark);
  document.documentElement.dataset.theme = theme;
}

/**
 * The same logic as the functions above, as a string, to be inlined in <head>.
 *
 * It has to be duplicated in this form because it must run before the first
 * paint — ahead of any bundle — or the browser shows a light page to a reader
 * who chose dark. Keeping it beside the functions it mirrors is the closest
 * thing to a single source of truth available here; the two must stay in step.
 */
export const THEME_INIT_SCRIPT = `
  try {
    var saved = localStorage.getItem('${STORAGE_KEY}');
    var pref = saved === 'dark' || saved === 'light' || saved === 'system' ? saved : 'system';
    var isDark = pref === 'system'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
      : pref === 'dark';

    if (isDark) document.documentElement.classList.add('dark');

    // Recorded so the theme toggle can paint the right icon from CSS alone,
    // before React hydrates.
    document.documentElement.dataset.theme = pref;
  } catch (e) {}
`;
