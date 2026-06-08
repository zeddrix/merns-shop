import { test, expect } from '@playwright/test';
import { assertHomeCatalogHealthy } from '../fixtures/test-helpers';
import { waitForPwaMilliseconds, waitForSWAndCaching } from './pwa-test-helpers';

test.describe('PWA manifest and install', () => {
  test('pwa_manifest_fields_and_icons', async ({ page, request }) => {
    await page.goto('/');
    await waitForSWAndCaching(page);

    const manifestLink = page.locator('link[rel="manifest"]');
    await expect(manifestLink).toHaveAttribute('href', /manifest/);

    const href = await manifestLink.getAttribute('href');
    expect(href).toBeTruthy();
    const response = await request.get(href as string);
    expect(response.status()).toBe(200);

    const manifest = await response.json();
    expect(manifest.name).toBeTruthy();
    expect(manifest.short_name).toBeTruthy();
    expect(manifest.start_url).toBe('/');
    expect(manifest.display).toBe('standalone');
    expect(manifest.theme_color).toBe('#212529');
    expect(manifest.icons.length).toBeGreaterThanOrEqual(2);

    const sizes = manifest.icons.map((icon: { sizes: string }) => icon.sizes);
    expect(sizes).toContain('192x192');
    expect(sizes).toContain('512x512');

    for (const icon of manifest.icons) {
      const iconResponse = await request.get(icon.src);
      expect(iconResponse.status()).toBe(200);
    }
  });

  test('pwa_manifest_linked_on_routes', async ({ page }) => {
    await page.goto('/');
    await assertHomeCatalogHealthy(page);
    await expect(page.locator('link[rel="manifest"]')).toHaveCount(1);

    await page.locator('[data-testid^="product-card-"]').first().click();
    await expect(page.locator('[data-testid="product-details"]')).toBeVisible();
    await expect(page.locator('link[rel="manifest"]')).toHaveCount(1);

    await page.goto('/cart');
    await expect(page.locator('link[rel="manifest"]')).toHaveCount(1);
  });

  test('pwa_install_header_button_simulated', async ({ page }) => {
    await page.goto('/');
    await waitForPwaMilliseconds(page, 2000, 'pwa lifecycle');

    await page.evaluate(() => {
      const prompt = {
        prompt: async () => undefined,
        userChoice: Promise.resolve({ outcome: 'dismissed' as const })
      };
      window.__e2eInstallPrompt = prompt as BeforeInstallPromptEvent;
      window.dispatchEvent(new Event('test-simulate-installable'));
    });

    await expect(page.locator('[data-testid="pwa-install-header-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="pwa-install-banner"]')).toHaveCount(0);
    await page.locator('[data-testid="pwa-install-header-button"]').click();
  });

  test('pwa_install_header_hidden_in_standalone', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: (query: string) => ({
          matches: query === '(display-mode: standalone)',
          media: query,
          addEventListener: () => undefined,
          removeEventListener: () => undefined
        })
      });
    });
    await page.goto('/');
    await waitForPwaMilliseconds(page, 500, 'standalone check');
    await expect(page.locator('[data-testid="pwa-install-header-button"]')).toHaveCount(0);
  });
});
