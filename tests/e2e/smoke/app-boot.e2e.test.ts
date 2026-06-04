import { test, expect } from '@playwright/test';
import { assertHomeCatalogHealthy } from '../fixtures/test-helpers';

test.describe('smoke app boot', () => {
  test('smoke_home_catalog_healthy', async ({ page, request }) => {
    await page.goto('/');
    expect(page.url()).toMatch(/localhost:5020/);
    await expect(page.locator('[data-testid="site-brand"]')).toHaveText("MERN's Shop");
    await expect(page.locator('[data-testid="home-heading"]')).toBeVisible();

    await assertHomeCatalogHealthy(page);

    const response = await request.get('/api/products');
    expect(response.ok()).toBeTruthy();
    const products = (await response.json()) as { products: unknown[] };
    expect(Array.isArray(products.products)).toBe(true);
    expect(products.products.length).toBeGreaterThan(0);

    const productImage = page.locator('[data-testid^="product-card-"] img').first();
    await expect(productImage).toHaveAttribute('src', /\/images\//);
    const loaded = await productImage.evaluate(
      (img: HTMLImageElement) => img.complete && img.naturalWidth > 0
    );
    expect(loaded).toBe(true);
  });

  test('smoke_open_product_from_home', async ({ page }) => {
    await page.goto('/');
    await assertHomeCatalogHealthy(page);

    await page.locator('[data-testid^="product-card-"]').first().locator('a').first().click();

    await expect(page.locator('[data-testid="product-details"]')).toBeVisible();
    await expect(page.locator('[data-testid="product-add-cart"]')).toBeVisible();
  });
});
