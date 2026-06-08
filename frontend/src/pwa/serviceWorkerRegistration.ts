import { registerSW } from 'virtual:pwa-register';

let updateServiceWorker: ((reloadPage?: boolean) => Promise<void>) | undefined;
let registered = false;
let needRefreshHandler: (() => void) | null = null;

export function registerAppServiceWorker(): void {
  if (registered || typeof window === 'undefined') {
    return;
  }
  registered = true;
  updateServiceWorker = registerSW({
    onNeedRefresh() {
      needRefreshHandler?.();
    },
    immediate: true
  });
}

export function setPwaNeedRefreshHandler(handler: () => void): void {
  needRefreshHandler = handler;
  if (!registered) {
    registerAppServiceWorker();
  }
}

export function getUpdateServiceWorker(): ((reloadPage?: boolean) => Promise<void>) | undefined {
  return updateServiceWorker;
}
