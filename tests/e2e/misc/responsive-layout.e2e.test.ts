import { test, expect } from '@playwright/test';
import {
  addFirstInStockProductToCart,
  assertHomeCatalogHealthy,
  assertNoHorizontalOverflow,
  completeShippingStep,
  loginAs,
  selectAppOption,
  selectVariantAndAddToCart
} from '../fixtures/test-helpers';
import { MOBILE_VIEWPORT } from '../fixtures/viewports';

test.describe('responsive layout', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
  });

  test('mobile_home_carousel_and_catalog', async ({ page }) => {
    await page.goto('/');
    await assertHomeCatalogHealthy(page);
    await expect(page.locator('[data-testid="home-heading"]')).toBeVisible();
    await assertNoHorizontalOverflow(page);

    const carouselImage = page.locator('[data-testid="product-carousel"] img').first();
    await expect(carouselImage).toBeVisible();
    await expect
      .poll(async () =>
        carouselImage.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)
      )
      .toBe(true);

    await page.locator('[data-testid^="product-card-"]').first().locator('a').first().click();
    await expect(page.locator('[data-testid="product-details"]')).toBeVisible();
  });

  test('mobile_nav_search_category_journey', async ({ page }) => {
    await page.goto('/');
    await assertHomeCatalogHealthy(page);

    await page.locator('[data-testid="navbar-toggle"]').click();
    await page.locator('[data-testid="search-input"]').fill('iPhone');
    await page.locator('[data-testid="search-submit"]').click();
    await expect(page).toHaveURL(/\/search\/iPhone/);
    await expect(page.locator('[data-testid="product-list"]').first()).toBeVisible();

    await page.goto('/');
    await page.locator('[data-testid="navbar-toggle"]').click();
    await page.locator('[data-testid="nav-category-phones"]').click();
    await expect(page).toHaveURL(/subcategory=Phones/);
    await assertNoHorizontalOverflow(page);
  });

  test('mobile_nav_cart_goes_to_page', async ({ page }) => {
    await loginAs(page, 'customer');
    await addFirstInStockProductToCart(page);
    await page.locator('[data-testid="nav-cart"]').click();
    await expect(page).toHaveURL(/\/cart/);
    await expect(page.locator('[data-testid="cart-screen"]')).toBeVisible();
  });

  test('mobile_cart_qty_and_checkout', async ({ page }) => {
    await loginAs(page, 'customer');
    await addFirstInStockProductToCart(page);
    await page.locator('[data-testid="nav-cart"]').click();
    await expect(page.locator('[data-testid="cart-screen"]')).toBeVisible();
    await assertNoHorizontalOverflow(page);

    const qtySelect = page.locator('[data-testid^="cart-qty-"]').first();
    const qtyTestId = (await qtySelect.getAttribute('data-testid'))?.replace('-trigger', '') ?? '';
    await selectAppOption(page, qtyTestId, '2');
    await expect(qtySelect).toContainText('2');
    await expect(page.locator('[data-testid="cart-checkout"]')).toBeVisible();

    await page.locator('[data-testid="cart-checkout"]').click();
    await expect(page).toHaveURL(/\/shipping/);
  });

  test('mobile_product_variant_add_to_cart', async ({ page }) => {
    await page.goto('/');
    await assertHomeCatalogHealthy(page);
    await page
      .locator('[data-testid^="product-card-"]')
      .filter({ hasNot: page.locator('text=Out of stock') })
      .first()
      .locator('a')
      .first()
      .click();
    await selectVariantAndAddToCart(page);
    await page.locator('[data-testid="nav-cart"]').click();
    await expect(page.locator('[data-testid="cart-screen"]')).toBeVisible();
    await expect(page.locator('[data-testid^="cart-item-"]').first()).toBeVisible();
    await assertNoHorizontalOverflow(page);
  });

  test('mobile_auth_modal_opens_and_closes', async ({ page }) => {
    await page.goto('/');
    await assertHomeCatalogHealthy(page);
    await page.locator('[data-testid="navbar-toggle"]').click();
    await page.locator('[data-testid="nav-login"]').click();
    await expect(page.locator('[data-testid="auth-modal"]')).toBeVisible();
    await assertNoHorizontalOverflow(page);
    await page.locator('[data-testid="auth-modal-close"]').click();
    await expect(page.locator('[data-testid="auth-modal"]')).toHaveCount(0);
    await expect(page.locator('[data-testid="nav-login"]')).toBeVisible();
  });

  test('mobile_checkout_steps_shipping_visible', async ({ page }) => {
    await loginAs(page, 'customer');
    await addFirstInStockProductToCart(page);
    await completeShippingStep(page);
    await expect(page.locator('[data-testid="checkout-steps"]')).toBeVisible();
    await expect(page.locator('[data-testid="payment-heading"]')).toBeVisible();
    await assertNoHorizontalOverflow(page);
  });
});
