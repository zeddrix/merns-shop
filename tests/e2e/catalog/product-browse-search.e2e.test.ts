import { test, expect } from '@playwright/test';

test.describe('catalog browse and search', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-testid="product-list"]').waitFor({ state: 'visible' });
  });

  test('product_browse_search', async ({ page }) => {
    const firstCard = page.locator('[data-testid^="product-card-"]').first();
    const productLink = firstCard.locator('a').first();
    const productName = (await productLink.innerText()).trim();

    await page.locator('[data-testid="search-input"]').fill(productName.split(' ')[0] ?? 'iPhone');
    await page.locator('[data-testid="search-submit"]').click();

    await expect(page.locator('[data-testid="product-list"]')).toBeVisible();
    await firstCard.locator('a').first().click();

    await expect(page.locator('[data-testid="product-details"]')).toBeVisible();
    await expect(page.locator('[data-testid="product-add-cart"]')).toBeVisible();
    await expect(page.locator('[data-testid="product-qty"]')).toBeVisible();
  });
});
