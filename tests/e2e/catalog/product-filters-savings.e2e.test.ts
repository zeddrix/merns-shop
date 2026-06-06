import { test, expect } from '@playwright/test';
import { fillSearchAndSubmit, selectAppOption } from '../fixtures/test-helpers';

const parsePriceFrom = async (card: ReturnType<import('@playwright/test').Page['locator']>) => {
  const text = await card.locator('[data-testid="product-price-display"]').innerText();
  const match = text.match(/\$([\d,]+\.\d{2})/);
  return match ? Number(match[1].replace(/,/g, '')) : 0;
};

test.describe('catalog filters and savings', () => {
  test.beforeEach(async ({ page }) => {
    await Promise.all([
      page.waitForResponse((response) => response.url().includes('/api/products') && response.ok()),
      page.goto('/')
    ]);
    await expect(page.locator('[data-testid="product-list"]').first()).toBeVisible();
    await expect(page.locator('[data-testid^="product-card-"]').first()).toBeVisible();
  });

  test('filter_brand_apple_shows_iphones', async ({ page }) => {
    await selectAppOption(page, 'filter-brand', 'Apple');
    await selectAppOption(page, 'filter-subcategory', 'Phones');
    await expect(page.locator('[data-testid="product-list"]')).toBeVisible();
    await expect(page.locator('[data-testid^="product-card-"]').first()).toContainText('iPhone');
    await expect(page.locator('[data-testid="product-savings-badge"]').first()).toBeVisible();
  });

  test('search_iphone_finds_multiple_parents', async ({ page }) => {
    await fillSearchAndSubmit(page, 'iPhone');
    await expect(page.locator('[data-testid^="product-card-"]')).toHaveCount(12);
    await page.locator('[data-testid="pagination-next"]').click();
    await expect(page).toHaveURL(/\/search\/iPhone\/page\/2/);
    await expect(page.locator('[data-testid^="product-card-"]').first()).toBeVisible();
  });

  test('pagination_window_uses_prev_and_next', async ({ page }) => {
    const pagination = page.locator('[data-testid="pagination"]');
    await expect(pagination.locator('[data-testid="pagination-next"]')).toBeVisible();
    await pagination.locator('[data-testid="pagination-next"] a').click();
    await expect(page).toHaveURL(/\/page\/2/);
    await expect(page.locator('[data-testid="product-list"]')).toBeVisible();
    await pagination.locator('[data-testid="pagination-prev"] a').click();
    await expect(page).not.toHaveURL(/\/page\/2/);
    await expect(page.locator('[data-testid="product-list"]')).toBeVisible();
  });

  test('sort_price_low_to_high', async ({ page }) => {
    await selectAppOption(page, 'filter-sort', 'price-asc');
    await expect(page.locator('[data-testid="product-list"]')).toBeVisible();
    const first = page.locator('[data-testid^="product-card-"]').first();
    const second = page.locator('[data-testid^="product-card-"]').nth(1);
    const firstPrice = await parsePriceFrom(first);
    const secondPrice = await parsePriceFrom(second);
    expect(firstPrice).toBeGreaterThan(0);
    expect(secondPrice).toBeGreaterThan(0);
    expect(firstPrice).toBeLessThanOrEqual(secondPrice);
  });

  test('filter_max_price_limits_results', async ({ page }) => {
    await page.locator('[data-testid="filter-max-price"]').fill('50');
    await expect(page.locator('[data-testid="product-list"]')).toBeVisible();
    const firstPrice = await parsePriceFrom(page.locator('[data-testid^="product-card-"]').first());
    expect(firstPrice).toBeLessThanOrEqual(50);
  });

  test('filter_min_price_narrows_results', async ({ page }) => {
    await page.locator('[data-testid="filter-min-price"]').fill('500');
    await expect(page).toHaveURL(/minPrice=500/);
    await expect(page.locator('[data-testid="product-list"]')).toBeVisible();
    const firstPrice = await parsePriceFrom(page.locator('[data-testid^="product-card-"]').first());
    expect(firstPrice).toBeGreaterThanOrEqual(500);
  });

  test('filter_clear_resets_query', async ({ page }) => {
    await selectAppOption(page, 'filter-brand', 'Apple');
    await expect(page).toHaveURL(/brand=Apple/);
    await expect(page.locator('[data-testid="filter-clear"]')).toBeVisible();
    await page.locator('[data-testid="filter-clear"]').click();
    await expect(page).not.toHaveURL(/\?/);
    await expect(page.locator('[data-testid^="product-card-"]').first()).toBeVisible();
    await expect(page.locator('[data-testid="filter-clear"]')).toHaveCount(0);
  });

  test('sort_price_desc_orders_results', async ({ page }) => {
    await selectAppOption(page, 'filter-sort', 'price-desc');
    await expect(page).toHaveURL(/sort=price-desc/);
    await expect(page.locator('[data-testid="product-list"]')).toBeVisible();
    const first = page.locator('[data-testid^="product-card-"]').first();
    const second = page.locator('[data-testid^="product-card-"]').nth(1);
    const firstPrice = await parsePriceFrom(first);
    const secondPrice = await parsePriceFrom(second);
    expect(firstPrice).toBeGreaterThan(0);
    expect(secondPrice).toBeGreaterThan(0);
    expect(firstPrice).toBeGreaterThanOrEqual(secondPrice);
  });
});
