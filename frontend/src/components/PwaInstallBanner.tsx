import { useEffect, useState } from 'react';
import { Alert, Button } from 'react-bootstrap';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

declare global {
  interface Window {
    __e2eInstallPrompt?: BeforeInstallPromptEvent;
  }
}

const PwaInstallBanner = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handler = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('test-simulate-installable', () => {
      if (window.__e2eInstallPrompt) {
        setDeferredPrompt(window.__e2eInstallPrompt);
      }
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  if (!deferredPrompt || dismissed) {
    return null;
  }

  const installHandler = async () => {
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  };

  return (
    <Alert
      variant="secondary"
      className="pwa-install-banner mb-0 rounded-0 d-flex flex-wrap align-items-center justify-content-center gap-2"
      data-testid="pwa-install-banner"
    >
      <span>Install MERN&apos;s Shop for quick access and offline browsing.</span>
      <Button size="sm" variant="primary" data-testid="pwa-install-button" onClick={installHandler}>
        Install
      </Button>
      <Button
        size="sm"
        variant="outline-secondary"
        data-testid="pwa-install-dismiss"
        onClick={() => setDismissed(true)}
      >
        Not now
      </Button>
    </Alert>
  );
};

export default PwaInstallBanner;
