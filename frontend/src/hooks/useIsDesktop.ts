import { useEffect, useState } from 'react';

const DESKTOP_QUERY = '(min-width: 992px)';

export const useIsDesktop = (): boolean => {
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(DESKTOP_QUERY).matches : false
  );

  useEffect(() => {
    const media = window.matchMedia(DESKTOP_QUERY);
    const onChange = () => setIsDesktop(media.matches);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  return isDesktop;
};
