import { test, expect } from '@playwright/test';
import {
  assertHomeCatalogHealthy,
  clearClientFetchCache,
  createPaidOrderViaApi,
  loginAs,
  loginAsAdmin,
  openAdminNavDropdown
} from '../fixtures/test-helpers';
import { resetE2eDatabase } from '../fixtures/reset-db';

const blockApi = { value: false };

test.describe('api unreachable smoke', () => {
  test.beforeEach(async ({ context, page }) => {
    await resetE2eDatabase(context);
    blockApi.value = false;
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await context.route(
      (url) => url.pathname.startsWith('/api/'),
      async (route) => {
        if (blockApi.value) {
          await route.fulfill({
            status: 500,
            contentType: 'text/plain',
            body: 'API unreachable'
          });
          return;
        }
        await route.continue();
      }
    );
  });

  test('home_api_unreachable_shows_single_friendly_banner', async ({ page }) => {
    blockApi.value = true;

    await page.goto('/');
    await expect(page.locator('[data-testid="site-brand"]')).toBeVisible();

    const banner = page.locator('[data-testid="api-unreachable-message"]');
    await expect(banner).toBeVisible();
    await expect(banner).toHaveCount(1);
    await expect(banner).toContainText("Can't reach the shop API");
    await expect(page.locator('[data-testid="home-carousel-error"]')).toHaveCount(0);
    await expect(page.locator('[data-testid="home-products-error"]')).toHaveCount(0);
    await expect(page.locator('[data-testid="product-list"]')).toHaveCount(0);
  });

  test('home_api_unreachable_retry_refetches_catalog', async ({ page }) => {
    blockApi.value = true;

    await page.goto('/');
    await expect(page.locator('[data-testid="api-unreachable-message"]')).toBeVisible();

    blockApi.value = false;
    await page.locator('[data-testid="api-unreachable-retry"]').click();

    await assertHomeCatalogHealthy(page);
  });

  test('product_detail_api_unreachable_shows_retry', async ({ page, request }) => {
    const productsResponse = await request.get('/api/products');
    expect(productsResponse.ok()).toBeTruthy();
    const body = (await productsResponse.json()) as { products: { _id: string }[] };
    const productId = body.products[0]?._id;
    expect(productId).toBeTruthy();

    blockApi.value = true;

    await page.goto(`/product/${productId}`);

    await expect(page.locator('[data-testid="product-api-unreachable"]')).toBeVisible();
    await expect(page.locator('[data-testid="api-unreachable-message"]')).toContainText(
      "Can't reach the shop API"
    );
    await expect(page.locator('[data-testid="product-not-found"]')).toHaveCount(0);

    blockApi.value = false;
    await page.locator('[data-testid="api-unreachable-retry"]').click();

    await expect(page.locator('[data-testid="product-details"]')).toBeVisible();
    await expect(page.locator('[data-testid="product-add-cart"]')).toBeVisible();
  });

  test('profile_api_unreachable_shows_retry', async ({ page }) => {
    await loginAs(page, 'customer');
    await expect(page.locator('[data-testid="nav-login"]')).toBeHidden();
    blockApi.value = true;
    await page.locator('#username').click();
    await page.locator('[data-testid="nav-profile"]').click();
    await expect(page).toHaveURL(/\/profile$/);
    const profileUnreachable = page.locator('[data-testid="profile-api-unreachable"]');
    await expect(profileUnreachable).toBeVisible();
    await expect(profileUnreachable).toHaveCount(1);
    await expect(profileUnreachable.locator('[data-testid="api-unreachable-retry"]')).toBeVisible();
    blockApi.value = false;
    await profileUnreachable.locator('[data-testid="api-unreachable-retry"]').click();
    await expect(page.locator('[data-testid="profile-form"]')).toBeVisible();
  });

  test('admin_list_api_unreachable_shows_retry', async ({ page }) => {
    await loginAsAdmin(page);
    await expect(page.locator('[data-testid="nav-login"]')).toBeHidden();
    blockApi.value = true;
    await clearClientFetchCache(page);
    await openAdminNavDropdown(page);
    await page.locator('[data-testid="nav-admin-products"]').click();
    await expect(page).toHaveURL(/\/admin\/productlist$/);
    await expect(page.locator('[data-testid="api-unreachable-message"]')).toBeVisible();
    blockApi.value = false;
    await page.locator('[data-testid="api-unreachable-retry"]').click();
    await expect(page.locator('[data-testid="admin-product-list"]')).toBeVisible();
  });

  test('order_detail_api_unreachable_shows_retry', async ({ page }) => {
    const orderId = await createPaidOrderViaApi(page, 'customer');
    await loginAs(page, 'customer');
    await page.goto(`/order/${orderId}`);
    await expect(page.locator('[data-testid="order-screen"]')).toBeVisible();

    let blockOrderFetch = false;
    await page.route(`**/api/orders/${orderId}`, async (route) => {
      if (blockOrderFetch && route.request().method() === 'GET') {
        await route.fulfill({
          status: 500,
          contentType: 'text/plain',
          body: 'API unreachable'
        });
        return;
      }
      await route.continue();
    });

    blockOrderFetch = true;
    await page.goto(`/order/${orderId}`);
    await expect(page.locator('[data-testid="api-unreachable-message"]')).toBeVisible();
    blockOrderFetch = false;
    await page.locator('[data-testid="api-unreachable-retry"]').click();
    await expect(page.locator('[data-testid="order-screen"]')).toBeVisible();
  });
});
