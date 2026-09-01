import { useEffect, useRef, useState } from 'react';

/**
 * Reveals an element the first time it scrolls into view, and stays revealed.
 *
 * Four copies of this observer had grown across the codebase — the about page,
 * the mobile filter bar, the desktop sidebar and a hook named for the one
 * caller it had (`headerVisible`/`headerRef`) — all with the same threshold and
 * root margin, all doing the same one-way latch. This is that behaviour, once.
 *
 * The element is captured at effect time rather than read from the ref during
 * cleanup, so the observer is always disconnected from the node it observed.
 */
export function useRevealOnScroll<T extends HTMLElement = HTMLDivElement>() {
  const [visible, setVisible] = useState(false);
  const ref = useRef<T>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) setVisible(true);
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return { visible, ref };
}
