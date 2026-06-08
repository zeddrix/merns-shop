import { test, expect } from '@playwright/test';
import {
  addFirstInStockProductToCart,
  assertHomeCatalogHealthy,
  loginAs
} from '../fixtures/test-helpers';
import {
  goOffline,
  goOnline,
  waitForPathCached,
  waitForApiUrlCached,
  waitForPwaMilliseconds,
  waitForSWAndCaching
} from './pwa-test-helpers';

test.describe('PWA offline shell', () => {
  test('pwa_offline_banner_toggle', async ({ page, context }) => {
    await page.goto('/');
    await waitForSWAndCaching(page);

    await goOffline(context, page);
    await expect(page.locator('[data-testid="offline-banner"]')).toBeVisible({ timeout: 5000 });

    await goOnline(context, page);
    await expect(page.locator('[data-testid="offline-banner"]')).toHaveCount(0);
    await expect(page.locator('[data-testid="home-heading"]')).toBeVisible();
  });

  test('pwa_cached_home_loads_offline', async ({ page, context }) => {
    await page.goto('/');
    await waitForSWAndCaching(page);
    await waitForPathCached(page, '/');

    await context.setOffline(true);
    await page.reload();
    await expect(page.locator('[data-testid="home-heading"]')).toBeVisible({ timeout: 15000 });
  });

  test('pwa_cart_readable_offline', async ({ page, context }) => {
    await page.goto('/');
    await waitForSWAndCaching(page);
    await loginAs(page, 'customer');
    await addFirstInStockProductToCart(page);
    await page.goto('/cart');
    await expect(page.locator('[data-testid="cart-screen"]')).toBeVisible();
    await waitForPathCached(page, '/cart');

    await context.setOffline(true);
    await page.reload();
    await expect(page.locator('[data-testid="cart-screen"]')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('[data-testid^="cart-item-"]').first()).toBeVisible();
  });

  test('pwa_cached_catalog_image_loads_offline', async ({ page, context }) => {
    await page.goto('/');
    await waitForSWAndCaching(page);
    await assertHomeCatalogHealthy(page);

    const cardImage = page.locator('[data-testid="catalog-card-media"] img').first();
    await expect(cardImage).toBeVisible();
    const imageSrc = await cardImage.getAttribute('src');
    expect(imageSrc).toBeTruthy();

    await waitForApiUrlCached(page, '/api/products?');
    await waitForPathCached(page, '/');
    await context.setOffline(true);
    await page.reload();
    await expect(page.locator('[data-testid="home-heading"]')).toBeVisible({ timeout: 15000 });

    const offlineImage = page.locator('[data-testid="catalog-card-media"] img').first();
    await expect(offlineImage).toBeVisible();
    const naturalWidth = await offlineImage.evaluate((img: HTMLImageElement) => img.naturalWidth);
    expect(naturalWidth).toBeGreaterThanOrEqual(200);
  });

  test('pwa_uncached_route_shows_offline_fallback', async ({ page, context }) => {
    await page.goto('/');
    await waitForSWAndCaching(page);

    await goOffline(context, page);
    await page.goto('/about');
    await waitForPwaMilliseconds(page, 3000, 'offline navigation settle');
    await expect(page.locator('[data-testid="offline-fallback-screen"]')).toBeVisible({
      timeout: 15000
    });
    await expect(page.getByRole('link', { name: 'Return home' })).toBeVisible();
    await page.getByRole('link', { name: 'View cart' }).click();
    await expect(page.locator('[data-testid="cart-screen"]')).toBeVisible({ timeout: 15000 });
  });
});
