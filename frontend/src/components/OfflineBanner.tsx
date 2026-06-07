import { useEffect, useState } from 'react';
import { Alert } from 'react-bootstrap';

const OfflineBanner = () => {
  const [offline, setOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOffline = () => setOffline(true);
    const handleOnline = () => setOffline(false);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);
    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  if (!offline) {
    return null;
  }

  return (
    <Alert
      variant="warning"
      className="offline-banner mb-0 rounded-0 text-center"
      data-testid="offline-banner"
    >
      You are offline. Browsing cached pages and your cart still work; checkout needs a connection.
    </Alert>
  );
};

export default OfflineBanner;
