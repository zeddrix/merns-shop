import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { PAGINATION_SCROLL_TARGET_KEY } from '../utils/paginationScroll';

const ScrollToTop = () => {
  const { pathname, search } = useLocation();
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const paginationPending = sessionStorage.getItem(PAGINATION_SCROLL_TARGET_KEY);
    if (paginationPending) {
      return;
    }

    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? 'auto' : 'instant'
    });
  }, [pathname, search, prefersReducedMotion]);

  return null;
};

export default ScrollToTop;
