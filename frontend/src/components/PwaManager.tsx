import { useEffect, useRef, useState } from 'react';
import { registerSW } from 'virtual:pwa-register';
import PwaUpdateBanner from './PwaUpdateBanner';

const PwaManager = () => {
  const [needRefresh, setNeedRefresh] = useState(false);
  const updateSWRef = useRef<((reloadPage?: boolean) => Promise<void>) | undefined>(undefined);

  useEffect(() => {
    updateSWRef.current = registerSW({
      onNeedRefresh() {
        setNeedRefresh(true);
      },
      immediate: true
    });

    const simulateUpdate = () => setNeedRefresh(true);
    window.addEventListener('test-simulate-sw-update', simulateUpdate);
    return () => window.removeEventListener('test-simulate-sw-update', simulateUpdate);
  }, []);

  if (!needRefresh) {
    return null;
  }

  return (
    <PwaUpdateBanner
      onReload={() => {
        void updateSWRef.current?.(true);
      }}
      onDismiss={() => setNeedRefresh(false)}
    />
  );
};

export default PwaManager;
