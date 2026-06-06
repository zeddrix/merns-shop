import { useLayoutEffect } from 'react';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';
import {
  consumePaginationScrollTarget,
  hasPaginationScrollTarget
} from '../utils/paginationScroll';

export function useScrollToTopOnPageChange(
  scrollTargetTestId: string,
  pageKey: string,
  contentReady = true
): void {
  const prefersReducedMotion = usePrefersReducedMotion();

  useLayoutEffect(() => {
    if (!contentReady || !hasPaginationScrollTarget(scrollTargetTestId)) {
      return;
    }

    const target = document.querySelector(`[data-testid="${scrollTargetTestId}"]`);
    if (!target) {
      return;
    }

    consumePaginationScrollTarget(scrollTargetTestId);
    target.scrollIntoView({
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
      block: 'start'
    });
  }, [pageKey, scrollTargetTestId, prefersReducedMotion, contentReady]);
}
