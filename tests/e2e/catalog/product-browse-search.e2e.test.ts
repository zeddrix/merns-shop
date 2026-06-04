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

  test('homepage_shows_carousel_and_pagination', async ({ page }) => {
    await expect(page.locator('[data-testid="product-carousel"]')).toBeVisible();
    await expect(page.locator('[data-testid="pagination"]')).toBeVisible();
    await page.locator('[data-testid="pagination-page-2"]').click();
    await expect(page).toHaveURL(/\/page\/2/);
    await expect(page.locator('[data-testid^="product-card-"]').first()).toBeVisible();
  });

  test('out_of_stock_disables_add_to_cart', async ({ page }) => {
    await page.locator('[data-testid="search-input"]').fill('Amazon Echo');
    await page.locator('[data-testid="search-submit"]').click();
    await page.locator('[data-testid^="product-card-"]').first().locator('a').first().click();
    await expect(page.locator('[data-testid="product-add-cart"]')).toBeDisabled();
  });

  test('search_no_results_shows_empty_state', async ({ page }) => {
    await page.locator('[data-testid="search-input"]').fill('zzzz-no-match-product-xyz');
    await page.locator('[data-testid="search-submit"]').click();
    await expect(page.locator('[data-testid="search-empty"]')).toBeVisible();
  });
});
