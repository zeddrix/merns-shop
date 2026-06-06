import { useLayoutEffect } from 'react';
import {
  consumePaginationScrollTarget,
  hasPaginationScrollTarget
} from '../utils/paginationScroll';
import { useScrollIntoViewOnKeyChange } from './useScrollIntoViewOnKeyChange';

export function useScrollToTopOnPageChange(
  scrollTargetTestId: string,
  pageKey: string,
  contentReady = true
): void {
  const scrollReady = contentReady && hasPaginationScrollTarget(scrollTargetTestId);

  useScrollIntoViewOnKeyChange(scrollTargetTestId, pageKey, scrollReady);

  useLayoutEffect(() => {
    if (scrollReady) {
      consumePaginationScrollTarget(scrollTargetTestId);
    }
  }, [pageKey, scrollTargetTestId, scrollReady]);
}
