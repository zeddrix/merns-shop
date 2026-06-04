import { useEffect, useState } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

export function usePrefersReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return false;
    }
    return window.matchMedia(QUERY).matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia(QUERY);
    const onChange = () => setReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener('change', onChange);
    setReducedMotion(mediaQuery.matches);
    return () => mediaQuery.removeEventListener('change', onChange);
  }, []);

  return reducedMotion;
}
