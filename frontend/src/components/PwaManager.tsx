import { useEffect, useRef, useState } from 'react';
import { getUpdateServiceWorker, setPwaNeedRefreshHandler } from '../pwa/serviceWorkerRegistration';
import PwaUpdateBanner from './PwaUpdateBanner';

const PwaManager = () => {
  const [needRefresh, setNeedRefresh] = useState(false);
  const updateSWRef = useRef<((reloadPage?: boolean) => Promise<void>) | undefined>(undefined);

  useEffect(() => {
    setPwaNeedRefreshHandler(() => {
      setNeedRefresh(true);
    });
    updateSWRef.current = getUpdateServiceWorker();

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
        void (async () => {
          const registration = await navigator.serviceWorker?.getRegistration();
          const hadWaitingWorker = Boolean(registration?.waiting);
          await updateSWRef.current?.(true);
          if (!hadWaitingWorker) {
            window.location.reload();
          }
        })();
      }}
      onDismiss={() => setNeedRefresh(false)}
    />
  );
};

export default PwaManager;
