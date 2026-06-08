import { useCallback, useEffect, useState } from 'react';

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const INSTALL_BANNER_DISMISSED_KEY = 'pwa-install-banner-dismissed';

declare global {
  interface Window {
    __e2eInstallPrompt?: BeforeInstallPromptEvent;
    __e2ePromptCalled?: boolean;
    __deferredInstallPrompt?: BeforeInstallPromptEvent | null;
  }
}

export const detectPwaInstalled = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return true;
  }
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return Boolean(nav.standalone);
};

export const hasServiceWorkerController = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }
  return Boolean(navigator.serviceWorker?.controller);
};

export const isInstallCapableBrowser = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }
  return (
    'serviceWorker' in navigator &&
    Boolean(document.querySelector('link[rel="manifest"]')) &&
    hasServiceWorkerController()
  );
};

const readEarlyDeferredPrompt = (): BeforeInstallPromptEvent | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  return window.__deferredInstallPrompt ?? null;
};

const readBannerDismissed = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }
  return localStorage.getItem(INSTALL_BANNER_DISMISSED_KEY) === 'true';
};

export const usePwaInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(() =>
    readEarlyDeferredPrompt()
  );
  const [isInstalled, setIsInstalled] = useState(() => detectPwaInstalled());
  const [installedCheckDone, setInstalledCheckDone] = useState(false);
  const [swControlling, setSwControlling] = useState(() => hasServiceWorkerController());
  const [bannerDismissed, setBannerDismissed] = useState(() => readBannerDismissed());

  useEffect(() => {
    let cancelled = false;

    const resolveInstalledState = async () => {
      let installed = detectPwaInstalled();
      const getRelatedApps = (
        navigator as Navigator & {
          getInstalledRelatedApps?: () => Promise<{ id?: string }[]>;
        }
      ).getInstalledRelatedApps;

      if (!installed && typeof getRelatedApps === 'function') {
        try {
          const relatedApps = await getRelatedApps.call(navigator);
          installed = relatedApps.length > 0;
        } catch {
          // Unsupported or blocked — fall back to display-mode checks only.
        }
      }

      if (!cancelled) {
        setIsInstalled(installed);
        setInstalledCheckDone(true);
      }
    };

    void resolveInstalledState();

    const syncDeferredPromptFromWindow = () => {
      const prompt = readEarlyDeferredPrompt();
      if (prompt) {
        setDeferredPrompt(prompt);
      }
    };

    const capturePrompt = (event: Event) => {
      event.preventDefault();
      const promptEvent = event as BeforeInstallPromptEvent;
      window.__deferredInstallPrompt = promptEvent;
      setDeferredPrompt(promptEvent);
    };

    const earlyCaptureHandler = () => {
      syncDeferredPromptFromWindow();
    };

    const simulateHandler = () => {
      if (window.__e2eInstallPrompt) {
        window.__deferredInstallPrompt = window.__e2eInstallPrompt;
        setDeferredPrompt(window.__e2eInstallPrompt);
      }
    };

    const installedHandler = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      window.__deferredInstallPrompt = null;
    };

    const earlyPrompt = readEarlyDeferredPrompt();
    if (earlyPrompt) {
      setDeferredPrompt(earlyPrompt);
    }

    window.addEventListener('beforeinstallprompt', capturePrompt);
    window.addEventListener('pwa-install-available', earlyCaptureHandler);
    window.addEventListener('test-simulate-installable', simulateHandler);
    window.addEventListener('appinstalled', installedHandler);

    return () => {
      cancelled = true;
      window.removeEventListener('beforeinstallprompt', capturePrompt);
      window.removeEventListener('pwa-install-available', earlyCaptureHandler);
      window.removeEventListener('test-simulate-installable', simulateHandler);
      window.removeEventListener('appinstalled', installedHandler);
    };
  }, []);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      return;
    }

    const handleControllerReady = () => {
      setSwControlling(true);
      const prompt = readEarlyDeferredPrompt();
      if (prompt) {
        setDeferredPrompt(prompt);
      }
    };

    const serviceWorker = navigator.serviceWorker;
    serviceWorker.addEventListener('controllerchange', handleControllerReady);
    void serviceWorker.ready.then(() => {
      handleControllerReady();
    });

    return () => {
      serviceWorker.removeEventListener('controllerchange', handleControllerReady);
    };
  }, []);

  const install = useCallback(async () => {
    if (!deferredPrompt) {
      return;
    }
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    window.__deferredInstallPrompt = null;
  }, [deferredPrompt]);

  const dismissBanner = useCallback(() => {
    localStorage.setItem(INSTALL_BANNER_DISMISSED_KEY, 'true');
    setBannerDismissed(true);
  }, []);

  const hasNativePrompt = Boolean(deferredPrompt);
  const installEnvironmentReady = isInstallCapableBrowser() && swControlling;
  const showInstallButton =
    installedCheckDone && !isInstalled && installEnvironmentReady && hasNativePrompt;
  const showInstallBanner = showInstallButton && !bannerDismissed;

  return {
    hasNativePrompt,
    showInstallButton,
    showInstallBanner,
    install,
    dismissBanner,
    isInstalled
  };
};
