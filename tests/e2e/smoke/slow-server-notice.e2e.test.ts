import { test, expect, type Page } from '@playwright/test';
import {
  assertHomeCatalogHealthy,
  createPaidOrderViaApi,
  installSlowServerSessionReset,
  loginAs,
  loginAsAdmin,
  registerDelayedApi,
  registerDelayedCatalogApi
} from '../fixtures/test-helpers';

const COLD_START_SIMULATION_DELAY_MS = 4000;

/** SPA shell is ready before catalog API resolves; avoid waiting for full `load` with delayed routes. */
async function gotoSpa(page: Page, path: string): Promise<void> {
  await page.goto(path, { waitUntil: 'domcontentloaded' });
}

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

    await gotoSpa(page, '/');
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

    await gotoSpa(page, '/');
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

    await gotoSpa(page, `/product/${productId}`);
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

    await gotoSpa(page, '/');
    await expect(page.locator('[data-testid="slow-server-banner"]')).toBeVisible();
    await page.locator('[data-testid="product-list"]').first().waitFor({ state: 'visible' });
    await expect(page.locator('[data-testid="slow-server-banner"]')).toHaveCount(0);

    await page.locator('[data-testid="pagination-next"]').click();
    await expect(page).toHaveURL(/\/page\/2/);
    await page.locator('[data-testid="product-list"]').first().waitFor({ state: 'visible' });
    await expect(page.locator('[data-testid="slow-server-banner"]')).toHaveCount(0);
  });

  test('admin_orderlist_slow_api_shows_notice_then_loads', async ({ page, context }) => {
    const delayOrdersApi = { value: true };
    await registerDelayedApi(context, '**/api/orders**', {
      delayMs: COLD_START_SIMULATION_DELAY_MS,
      enabled: delayOrdersApi
    });

    await loginAsAdmin(page);
    await gotoSpa(page, '/admin/orderlist');
    await expect(page.locator('[data-testid="slow-server-banner"]')).toBeVisible();
    await expect(page.locator('[data-testid="admin-order-list"]')).toBeVisible();
    await expect(page.locator('[data-testid="slow-server-banner"]')).toHaveCount(0);
  });

  test('profile_slow_myorders_shows_notice_then_loads', async ({ page, context }) => {
    const delayMyOrdersApi = { value: true };
    await registerDelayedApi(context, '**/api/orders/myorders**', {
      delayMs: COLD_START_SIMULATION_DELAY_MS,
      enabled: delayMyOrdersApi
    });

    await loginAs(page, 'customer');
    await gotoSpa(page, '/profile');
    await expect(page.locator('[data-testid="slow-server-banner"]')).toBeVisible();
    await expect(page.locator('[data-testid="my-orders-table"]')).toBeVisible();
    await expect(page.locator('[data-testid="slow-server-banner"]')).toHaveCount(0);
  });

  test('order_detail_slow_api_shows_notice_then_loads', async ({ page, context }) => {
    const orderId = await createPaidOrderViaApi(page, 'customer');
    const delayOrderDetailApi = { value: true };
    await registerDelayedApi(context, `**/api/orders/${orderId}`, {
      delayMs: COLD_START_SIMULATION_DELAY_MS,
      enabled: delayOrderDetailApi,
      method: 'GET'
    });

    await loginAs(page, 'customer');
    await gotoSpa(page, `/order/${orderId}`);
    await expect(page.locator('[data-testid="slow-server-banner"]')).toBeVisible();
    await expect(page.locator('[data-testid="order-screen"]')).toBeVisible();
    await expect(page.locator('[data-testid="slow-server-banner"]')).toHaveCount(0);
  });

  test('session_warmed_skips_notice_on_subsequent_slow_admin_load', async ({ page, context }) => {
    const delayOrdersApi = { value: true };
    await registerDelayedApi(context, '**/api/orders**', {
      delayMs: COLD_START_SIMULATION_DELAY_MS,
      enabled: delayOrdersApi
    });

    await loginAsAdmin(page);
    await gotoSpa(page, '/admin/orderlist');
    await expect(page.locator('[data-testid="slow-server-banner"]')).toBeVisible();
    await expect(page.locator('[data-testid="admin-order-list"]')).toBeVisible();
    await expect(page.locator('[data-testid="slow-server-banner"]')).toHaveCount(0);

    await gotoSpa(page, '/admin/orderlist');
    await expect(page.locator('[data-testid="admin-order-list"]')).toBeVisible();
    await expect(page.locator('[data-testid="slow-server-banner"]')).toHaveCount(0);
  });

  test('home_fast_catalog_hides_notice', async ({ page }) => {
    await gotoSpa(page, '/');
    await page.locator('[data-testid="pagination-next"]').click();
    await expect(page).toHaveURL(/\/page\/2/);
    await page.locator('[data-testid="pagination-prev"]').click();
    await expect(page.locator('[data-testid="slow-server-banner"]')).toHaveCount(0);
    await assertHomeCatalogHealthy(page);
  });
});
