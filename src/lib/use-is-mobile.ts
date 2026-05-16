import { useEffect, useState } from 'react';

/**
 * Viewport breakpoint (in px) below which we treat the UI as "mobile".
 * Matches Tailwind's default `md` breakpoint so utility classes like
 * `md:flex` line up with the JS behavior switch.
 */
export const MOBILE_BREAKPOINT_PX = 768;

/**
 * Returns `true` whenever the viewport width is below
 * {@link MOBILE_BREAKPOINT_PX}. Subscribes to `matchMedia` so callers
 * re-render on rotate / window resize without polling. Server-rendered
 * pages start as `false` and update on hydration.
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
    return window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT_PX - 1}px)`).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT_PX - 1}px)`);
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    // Sync on mount in case state seeded before media query attached.
    setIsMobile(mql.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return isMobile;
}
