import { test, expect } from '@playwright/test';
import {
  assertHomeCatalogHealthy,
  addFirstInStockProductToCart,
  loginAs
} from '../fixtures/test-helpers';

test.describe('performance shell', () => {
  const isLazyRouteRequest = (url: string): boolean => {
    if (url.includes('/assets/') && url.endsWith('.js') && !url.includes('index-')) {
      return true;
    }
    return /\/src\/screens\/\w+Screen\.tsx/.test(url);
  };

  test('home_catalog_lazy_images', async ({ page }) => {
    await page.goto('/');
    await assertHomeCatalogHealthy(page);

    const firstCardMedia = page.locator('[data-testid="catalog-card-media"] img').first();
    await expect(firstCardMedia).toBeVisible();
    await expect(firstCardMedia).toHaveAttribute('loading', 'lazy');
    await expect(firstCardMedia).toHaveAttribute('srcset', /.+/);
  });

  test('home_carousel_lcp_priority', async ({ page }) => {
    await page.goto('/');
    await assertHomeCatalogHealthy(page);

    const carouselImage = page.locator('[data-testid="product-carousel"] img').first();
    await expect(carouselImage).toBeVisible();
    await expect(carouselImage).toHaveAttribute('fetchpriority', 'high');
    await expect(carouselImage).toHaveAttribute('loading', 'eager');
  });

  test('admin_route_loads_separate_chunk', async ({ page }) => {
    const chunkRequests: string[] = [];

    page.on('request', (request) => {
      const url = request.url();
      if (isLazyRouteRequest(url)) {
        chunkRequests.push(url);
      }
    });

    await page.goto('/');
    await assertHomeCatalogHealthy(page);

    await loginAs(page, 'admin');
    const beforeAdminChunks = chunkRequests.length;
    await page.goto('/admin/productlist');
    await expect(page.locator('[data-testid="admin-product-list"]')).toBeVisible();

    expect(chunkRequests.length).toBeGreaterThan(beforeAdminChunks);
  });

  test('checkout_route_loads_separate_chunk', async ({ page }) => {
    const chunkRequests: string[] = [];

    page.on('request', (request) => {
      const url = request.url();
      if (isLazyRouteRequest(url)) {
        chunkRequests.push(url);
      }
    });

    await loginAs(page, 'customer');
    await addFirstInStockProductToCart(page);

    await page.goto('/');
    await assertHomeCatalogHealthy(page);

    const beforeCheckoutChunks = chunkRequests.length;
    await page.goto('/cart');
    await expect(page.locator('[data-testid="cart-screen"]')).toBeVisible();
    await page.locator('[data-testid="cart-checkout"]').click();
    await expect(page.locator('[data-testid="checkout-screen"]')).toBeVisible();

    expect(chunkRequests.length).toBeGreaterThan(beforeCheckoutChunks);
  });

  test('catalog_list_reuses_product_api_cache_on_back_navigation', async ({ page }) => {
    const productRequests: string[] = [];

    page.on('request', (request) => {
      const url = request.url();
      if (url.includes('/api/products?') && request.method() === 'GET') {
        productRequests.push(url);
      }
    });

    await page.goto('/page/2');
    await assertHomeCatalogHealthy(page);
    const initialCount = productRequests.length;
    expect(initialCount).toBeGreaterThan(0);

    const firstCard = page.locator('[data-testid^="product-card-"]').first();
    await firstCard.click();
    await expect(page.locator('[data-testid="product-details"]')).toBeVisible();
    await page.goBack();
    await expect(page.locator('[data-testid="product-list"]')).toBeVisible();

    expect(productRequests.length).toBe(initialCount);
  });
});
