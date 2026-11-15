import { useCallback, useSyncExternalStore } from 'react';

function subscribeToScroll(onChange: () => void) {
  window.addEventListener('scroll', onChange, { passive: true });
  return () => window.removeEventListener('scroll', onChange);
}

/**
 * Whether the window is scrolled further than `threshold` pixels.
 *
 * Read from the scroll position itself rather than kept in state updated by
 * scroll events. A page already scrolled when it hydrates — the reader
 * scrolled while scripts loaded, or the browser restored a position — fires no
 * further event, so event-driven state stayed wrong until the next scroll.
 *
 * The snapshot is a boolean, so callers re-render only when the threshold is
 * crossed, not on every scroll event. The server snapshot is `false`, which
 * keeps hydration matching the HTML; React then re-renders straight away with
 * the real position.
 */
export function useScrolledPast(threshold: number): boolean {
  const getSnapshot = useCallback(() => window.scrollY > threshold, [threshold]);
  return useSyncExternalStore(subscribeToScroll, getSnapshot, () => false);
}
