import { test, expect } from '@playwright/test';

test.describe('smoke app boot', () => {
  test('smoke_app_and_api_boot', async ({ page, request }) => {
    await page.goto('/');
    await expect(page.locator('[data-testid="site-brand"]')).toHaveText("MERN's Shop");
    await expect(page.locator('[data-testid="home-heading"]')).toBeVisible();

    const response = await request.get('/api/products');
    expect(response.ok()).toBeTruthy();
    const products = (await response.json()) as { products: unknown[] };
    expect(Array.isArray(products.products)).toBe(true);
    expect(products.products.length).toBeGreaterThan(0);

    await expect(page.locator('[data-testid="product-list"]')).toBeVisible();
    await expect(page.locator('[data-testid^="product-card-"]').first()).toBeVisible();

    const productImage = page.locator('[data-testid^="product-card-"] img').first();
    await expect(productImage).toHaveAttribute('src', /\/images\//);
    const loaded = await productImage.evaluate(
      (img: HTMLImageElement) => img.complete && img.naturalWidth > 0
    );
    expect(loaded).toBe(true);
  });
});
