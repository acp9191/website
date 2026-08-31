'use client';

import { useEffect, useLayoutEffect } from 'react';
import { readStoredTheme, applyTheme } from '@/src/lib/theme';

// useLayoutEffect warns when it runs during server rendering. There is nothing
// to synchronise there, so fall back to useEffect, which never runs on the server.
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/**
 * Re-applies the stored theme to <html> whenever React mounts this subtree.
 *
 * The inline head script writes the `dark` class and `data-theme` imperatively,
 * and React knows about neither. `[locale]` sits *above* the root layout, so
 * switching language remounts that layout and React rebuilds <html> from its own
 * props — silently discarding both, and dropping a reader who chose dark mode
 * onto a light page. (The old <html> is replaced outright, which is why even a
 * MutationObserver on it sees nothing.)
 *
 * A layout effect runs after React has committed the new element but before the
 * browser paints, so the theme is restored without a visible flash.
 */
export default function ThemeSync() {
  useIsomorphicLayoutEffect(() => {
    applyTheme(readStoredTheme());
  });

  return null;
}
