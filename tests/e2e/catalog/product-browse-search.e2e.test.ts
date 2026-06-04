import { test, expect } from '@playwright/test';
import {
  assertHomeCatalogHealthy,
  openProductByExactName,
  selectVariantAndAddToCart
} from '../fixtures/test-helpers';

const IPHONE_15_PRO = 'iPhone 15 Pro';

test.describe('catalog browse and search', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await assertHomeCatalogHealthy(page);
  });

  test('product_browse_search', async ({ page }) => {
    await page.locator('[data-testid="search-input"]').fill(IPHONE_15_PRO);
    await page.locator('[data-testid="search-submit"]').click();
    await expect(page.locator('[data-testid="product-list"]')).toBeVisible();
    await expect(page.locator('[data-testid="product-savings-badge"]').first()).toBeVisible();
    await page.getByRole('link', { name: IPHONE_15_PRO, exact: true }).first().click();
    await expect(page.locator('[data-testid="product-details"]')).toBeVisible();
    await expect(page).toHaveTitle(/iPhone 15 Pro/);
    await expect(page.locator('meta[name="description"][content*="Titanium"]')).toHaveAttribute(
      'content',
      /Titanium design/i
    );
    const jsonLdRaw = await page
      .locator('script[type="application/ld+json"]')
      .first()
      .textContent();
    expect(jsonLdRaw).toBeTruthy();
    const jsonLd = JSON.parse(jsonLdRaw ?? '{}') as {
      '@type': string;
      name: string;
      offers: unknown;
    };
    expect(jsonLd['@type']).toBe('Product');
    expect(jsonLd.name).toBe(IPHONE_15_PRO);
    expect(jsonLd.offers).toBeTruthy();
    await expect(page.locator('[data-testid="product-variant-picker"]')).toBeVisible();
    await page.locator('input[data-testid="product-variant-iphone-15-pro-128gb"]').check();
    await expect(page.locator('[data-testid="product-qty"]')).toBeVisible();
  });

  test('variant_required_before_add_to_cart', async ({ page }) => {
    await openProductByExactName(page, IPHONE_15_PRO);

    await page.locator('[data-testid="product-add-cart"]').click();
    await expect(page.locator('[data-testid="product-variant-error"]')).toBeVisible();
    await expect(page).not.toHaveURL(/\/cart\//);

    await page.locator('input[data-testid="product-variant-iphone-15-pro-256gb"]').check();
    await Promise.all([
      page.waitForURL(/\/cart\//),
      page.locator('[data-testid="product-add-cart"]').click()
    ]);
    await expect(page.locator('[data-testid="cart-screen"]')).toBeVisible();
    await expect(page.locator('[data-testid^="cart-item-"]').first()).toContainText('256GB');
  });

  test('product_image_loads_offline', async ({ page }) => {
    await openProductByExactName(page, IPHONE_15_PRO);

    const productImage = page.locator('[data-testid="product-details"] img');
    await expect(productImage).toHaveAttribute('src', /\/images\/catalog\//);
    await expect(productImage).toHaveAttribute('alt', IPHONE_15_PRO);
    await expect
      .poll(async () =>
        productImage.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)
      )
      .toBe(true);
  });

  test('qty_capped_at_10', async ({ page }) => {
    await openProductByExactName(page, IPHONE_15_PRO);
    await page.locator('input[data-testid="product-variant-iphone-15-pro-256gb"]').check();

    const qtySelect = page.locator('[data-testid="product-qty"]');
    const options = qtySelect.locator('option');
    await expect(options).toHaveCount(10);
    await expect(options.last()).toHaveText('10');
  });

  test('cart_supports_two_variants_same_product', async ({ page }) => {
    await openProductByExactName(page, IPHONE_15_PRO);

    await page.locator('input[data-testid="product-variant-iphone-15-pro-128gb"]').check();
    await selectVariantAndAddToCart(page);

    await openProductByExactName(page, IPHONE_15_PRO);

    await page.locator('input[data-testid="product-variant-iphone-15-pro-256gb"]').check();
    await selectVariantAndAddToCart(page);

    await expect(page.locator('[data-testid^="cart-item-"]')).toHaveCount(2);
    await expect(page.getByText('128GB')).toBeVisible();
    await expect(page.getByText('256GB')).toBeVisible();
  });

  test('homepage_shows_carousel_and_pagination', async ({ page }) => {
    await expect(page.locator('[data-testid="product-carousel"]')).toBeVisible();
    await expect(page.locator('[data-testid="pagination"]')).toBeVisible();
    await page.locator('[data-testid="pagination-next"]').click();
    await expect(page).toHaveURL(/\/page\/2/);
    await expect(page.locator('[data-testid^="product-card-"]').first()).toBeVisible();
  });

  test('out_of_stock_disables_add_to_cart', async ({ page }) => {
    await page.locator('[data-testid="search-input"]').fill('Amazon Echo');
    await page.locator('[data-testid="search-submit"]').click();
    await page.locator('[data-testid^="product-card-"]').first().locator('a').first().click();
    await expect(page.locator('[data-testid="product-variant-picker"]')).toBeVisible();
    await expect(page.locator('input[data-testid^="product-variant-"]')).toHaveCount(2);
    await expect(page.locator('[data-testid="product-add-cart"]')).toBeDisabled();
  });

  test('search_no_results_shows_empty_state', async ({ page }) => {
    await page.locator('[data-testid="search-input"]').fill('zzzz-no-match-product-xyz');
    await page.locator('[data-testid="search-submit"]').click();
    await expect(page.locator('[data-testid="search-empty"]')).toBeVisible();
  });
});
