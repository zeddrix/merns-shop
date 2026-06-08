import { expect, type BrowserContext, type Page } from '@playwright/test';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/**
 * PWA-only timed wait (service worker cache lifecycle).
 * This is the only E2E file allowed to use waitForTimeout.
 */
export async function waitForPwaMilliseconds(page: Page, ms: number, _reason: string) {
  await page.waitForTimeout(ms);
}

export async function waitForSWAndCaching(page: Page) {
  await page.waitForFunction(() => navigator.serviceWorker?.controller !== null, null, {
    timeout: 20000
  });
  await waitForPwaMilliseconds(page, 8000, 'runtime cache warm-up after SW activation');
}

export async function goOffline(context: BrowserContext, page: Page) {
  await context.setOffline(true);
  await page.evaluate(() => window.dispatchEvent(new Event('offline')));
}

export async function goOnline(context: BrowserContext, page: Page) {
  await context.setOffline(false);
  await page.evaluate(() => window.dispatchEvent(new Event('online')));
}

export async function waitForPathCached(page: Page, pathname: string, timeoutMs = 30000) {
  await page.waitForFunction(
    async (path) => {
      const cacheNames = await caches.keys();
      for (const name of cacheNames) {
        const cache = await caches.open(name);
        const keys = await cache.keys();
        if (keys.some((request) => new URL(request.url).pathname === path)) {
          return true;
        }
      }
      return false;
    },
    pathname,
    { timeout: timeoutMs }
  );
}

export async function waitForApiUrlCached(page: Page, urlPart: string, timeoutMs = 30000) {
  await page.waitForFunction(
    async (part) => {
      const cacheNames = await caches.keys();
      for (const name of cacheNames) {
        const cache = await caches.open(name);
        const keys = await cache.keys();
        if (keys.some((request) => request.url.includes(part))) {
          return true;
        }
      }
      return false;
    },
    urlPart,
    { timeout: timeoutMs }
  );
}

export async function suppressUpdateBanner(page: Page) {
  const dismiss = page.locator('[data-testid="pwa-update-dismiss"]');
  if (await dismiss.isVisible({ timeout: 2000 }).catch(() => false)) {
    await dismiss.click();
  }
}

export async function simulateSwUpdate(page: Page) {
  await page.evaluate(() => {
    window.dispatchEvent(new CustomEvent('test-simulate-sw-update'));
  });
}

export async function clearInstallBannerDismiss(page: Page) {
  await page.addInitScript(() => {
    localStorage.removeItem('pwa-install-banner-dismissed');
    window.__e2ePromptCalled = false;
  });
}

export async function simulateInstallable(page: Page) {
  await page.evaluate(() => {
    const prompt = {
      prompt: async () => {
        window.__e2ePromptCalled = true;
      },
      userChoice: Promise.resolve({ outcome: 'dismissed' as const })
    };
    window.__e2eInstallPrompt = prompt as BeforeInstallPromptEvent;
    window.__deferredInstallPrompt = prompt as BeforeInstallPromptEvent;
    window.dispatchEvent(new Event('test-simulate-installable'));
  });
}

export async function initSWAndLogin(page: Page, email: string, password: string) {
  await page.goto('/', { waitUntil: 'load' });
  await waitForSWAndCaching(page);
  await suppressUpdateBanner(page);
  await page
    .locator('[data-testid="nav-login"]')
    .click({ timeout: 5000 })
    .catch(async () => {
      await page.locator('[data-testid="navbar-toggle"]').click();
      await page.locator('[data-testid="nav-login"]').click();
    });
  await page.locator('[data-testid="login-email"]').fill(email);
  await page.locator('[data-testid="login-password"]').fill(password);
  await Promise.all([
    page.waitForResponse(
      (response) => response.url().includes('/api/users/login') && response.status() === 200
    ),
    page.locator('[data-testid="login-submit"]').click()
  ]);
  await expect(page.locator('[data-testid="nav-login"]')).toBeHidden();
}
