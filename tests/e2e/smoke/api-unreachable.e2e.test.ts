import { test, expect } from '@playwright/test';
import { assertHomeCatalogHealthy } from '../fixtures/test-helpers';

const blockApi = { value: false };

test.describe('api unreachable smoke', () => {
  test.beforeEach(async ({ context, page }) => {
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
});
