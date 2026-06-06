import { useLayoutEffect, useRef } from 'react';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

export function useScrollIntoViewOnKeyChange(
  scrollTargetTestId: string,
  changeKey: string,
  contentReady = true
): void {
  const prefersReducedMotion = usePrefersReducedMotion();
  const scrolledKeyRef = useRef<string | null>(null);

  useLayoutEffect(() => {
    if (!contentReady || !changeKey) {
      return;
    }

    if (scrolledKeyRef.current === changeKey) {
      return;
    }

    const target = document.querySelector(`[data-testid="${scrollTargetTestId}"]`);
    if (!target) {
      return;
    }

    scrolledKeyRef.current = changeKey;
    target.scrollIntoView({
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
      block: 'start'
    });
  }, [changeKey, scrollTargetTestId, prefersReducedMotion, contentReady]);
}
