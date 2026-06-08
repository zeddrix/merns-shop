import { test, expect } from '@playwright/test';
import {
  assertHomeCatalogHealthy,
  installSlowServerSessionReset,
  registerDelayedCatalogApi
} from '../fixtures/test-helpers';

const COLD_START_SIMULATION_DELAY_MS = 4000;

test.describe('smoke slow server notice', () => {
  test.beforeEach(async ({ page }) => {
    await installSlowServerSessionReset(page);
  });

  test('home_slow_catalog_shows_notice_then_catalog_loads', async ({ page, context }) => {
    const delayCatalogApi = { value: true };
    await registerDelayedCatalogApi(context, {
      delayMs: COLD_START_SIMULATION_DELAY_MS,
      enabled: delayCatalogApi
    });

    await page.goto('/');
    await expect(page.locator('[data-testid="slow-server-banner"]')).toBeVisible();
    await page.locator('[data-testid="product-list"]').first().waitFor({ state: 'visible' });
    await expect(page.locator('[data-testid="slow-server-banner"]')).toHaveCount(0);

    await page.locator('[data-testid="pagination-next"]').click();
    await expect(page).toHaveURL(/\/page\/2/);
    await expect(page.locator('[data-testid="slow-server-banner"]')).toHaveCount(0);
  });

  test('home_slow_catalog_shows_single_consolidated_loader', async ({ page, context }) => {
    const delayCatalogApi = { value: true };
    await registerDelayedCatalogApi(context, {
      delayMs: COLD_START_SIMULATION_DELAY_MS,
      enabled: delayCatalogApi
    });

    await page.goto('/');
    await expect(page.locator('[data-testid="home-catalog-loader"]')).toBeVisible();
    await expect(page.locator('[data-testid="page-loader"]')).toHaveCount(0);
    await page.locator('[data-testid="product-list"]').first().waitFor({ state: 'visible' });
    await expect(page.locator('[data-testid="home-catalog-loader"]')).toHaveCount(0);
  });

  test('product_detail_slow_catalog_shows_notice_then_pdp_loads', async ({
    page,
    context,
    request
  }) => {
    const listResponse = await request.get('/api/products');
    expect(listResponse.ok()).toBeTruthy();
    const body = (await listResponse.json()) as { products: Array<{ _id: string }> };
    const productId = body.products[0]?._id;
    expect(productId).toBeTruthy();

    const delayCatalogApi = { value: true };
    await registerDelayedCatalogApi(context, {
      delayMs: COLD_START_SIMULATION_DELAY_MS,
      enabled: delayCatalogApi
    });

    await page.goto(`/product/${productId}`);
    await expect(page).toHaveURL(/\/product\//);
    await expect(page.locator('[data-testid="slow-server-banner"]')).toBeVisible();
    await expect(page.locator('[data-testid="product-add-cart"]')).toBeVisible();
    await expect(page.locator('[data-testid="slow-server-banner"]')).toHaveCount(0);
  });

  test('session_warmed_skips_notice_on_subsequent_slow_catalog_load', async ({ page, context }) => {
    const delayCatalogApi = { value: true };
    await registerDelayedCatalogApi(context, {
      delayMs: COLD_START_SIMULATION_DELAY_MS,
      enabled: delayCatalogApi
    });

    await page.goto('/');
    await expect(page.locator('[data-testid="slow-server-banner"]')).toBeVisible();
    await page.locator('[data-testid="product-list"]').first().waitFor({ state: 'visible' });
    await expect(page.locator('[data-testid="slow-server-banner"]')).toHaveCount(0);

    await page.locator('[data-testid="pagination-next"]').click();
    await expect(page).toHaveURL(/\/page\/2/);
    await page.locator('[data-testid="product-list"]').first().waitFor({ state: 'visible' });
    await expect(page.locator('[data-testid="slow-server-banner"]')).toHaveCount(0);
  });

  test('home_fast_catalog_hides_notice', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-testid="pagination-next"]').click();
    await expect(page).toHaveURL(/\/page\/2/);
    await page.locator('[data-testid="pagination-prev"]').click();
    await expect(page.locator('[data-testid="slow-server-banner"]')).toHaveCount(0);
    await assertHomeCatalogHealthy(page);
  });
});
