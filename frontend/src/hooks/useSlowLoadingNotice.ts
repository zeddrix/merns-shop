import { useEffect, useState } from 'react';
import { SLOW_SERVER_NOTICE_DELAY_MS } from '../constants/slowServerNotice';

export const useSlowLoadingNotice = (
  isLoading: boolean,
  delayMs: number = SLOW_SERVER_NOTICE_DELAY_MS
): boolean => {
  const [showNotice, setShowNotice] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setShowNotice(false);
      return undefined;
    }

    const timer = window.setTimeout(() => setShowNotice(true), delayMs);
    return () => {
      window.clearTimeout(timer);
    };
  }, [isLoading, delayMs]);

  return showNotice;
};
