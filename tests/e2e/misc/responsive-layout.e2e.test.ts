import { test, expect } from '@playwright/test';
import {
  addFirstInStockProductToCart,
  assertHomeCatalogHealthy,
  assertNoHorizontalOverflow,
  clickProductCardToPdp,
  loginAs,
  selectAppOption,
  selectVariantAndAddToCart
} from '../fixtures/test-helpers';
import { MOBILE_VIEWPORT, TABLET_VIEWPORT } from '../fixtures/viewports';

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

    await clickProductCardToPdp(page.locator('[data-testid^="product-card-"]').first());
    await expect(page.locator('[data-testid="product-details"]')).toBeVisible();
    const heroImage = page.locator('[data-testid="product-details"] img').first();
    await expect(heroImage).toHaveAttribute('srcset', /.+/);
    await expect
      .poll(async () => heroImage.evaluate((img: HTMLImageElement) => img.naturalWidth))
      .toBeGreaterThan(200);
  });

  test('mobile_nav_search_category_journey', async ({ page }) => {
    await page.goto('/');
    await assertHomeCatalogHealthy(page);

    await page.locator('[data-testid="navbar-toggle"]').click();
    const phonesLeft = await page
      .locator('[data-testid="nav-category-phones"]')
      .evaluate((el) => el.getBoundingClientRect().left);
    const aboutLeft = await page
      .locator('[data-testid="nav-about"]')
      .evaluate((el) => el.getBoundingClientRect().left);
    const signUpLeft = await page
      .locator('[data-testid="nav-sign-up"]')
      .evaluate((el) => el.getBoundingClientRect().left);
    expect(Math.abs(phonesLeft - aboutLeft)).toBeLessThan(2);
    expect(Math.abs(aboutLeft - signUpLeft)).toBeLessThan(2);

    await page.locator('[data-testid="search-input"]').fill('iPhone');
    await page.locator('[data-testid="search-submit"]').click();
    await expect(page).toHaveURL(/\/search\/iPhone/);
    await expect(page.locator('[data-testid="product-list"]').first()).toBeVisible();

    await page.goto('/');
    await page.locator('[data-testid="navbar-toggle"]').click();
    await page.locator('[data-testid="nav-category-phones"]').click();
    await expect(page).toHaveURL(/subcategory=Phones/);
    await expect(page.locator('[data-testid="product-carousel"]')).toHaveCount(0);
    await expect(page.locator('[data-testid="product-list"]').first()).toBeVisible();
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
    await expect(page).toHaveURL(/\/checkout/);
  });

  test('mobile_product_variant_add_to_cart', async ({ page }) => {
    await page.goto('/');
    await assertHomeCatalogHealthy(page);
    const inStockCard = page
      .locator('[data-testid^="product-card-"]')
      .filter({ hasNot: page.locator('text=Out of stock') })
      .first();
    await clickProductCardToPdp(inStockCard);
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

  test('mobile_unified_checkout_form_and_summary_visible', async ({ page }) => {
    await loginAs(page, 'customer');
    await addFirstInStockProductToCart(page);
    await page.goto('/checkout');
    await expect(page.locator('[data-testid="checkout-progress"]')).toBeVisible();
    await expect(page.locator('[data-testid="checkout-progress-order-details"]')).toBeVisible();
    await expect(page.locator('[data-testid="checkout-progress-payment"]')).toBeVisible();
    await page.locator('[data-testid="checkout-address"]').fill('123 Mobile St');
    await page.locator('[data-testid="checkout-city"]').fill('Testville');
    await expect(page.locator('[data-testid="checkout-summary-card"]')).toBeVisible();
    await assertNoHorizontalOverflow(page);
  });

  test('mobile_footer_links_accessible', async ({ page }) => {
    await page.goto('/');
    await assertHomeCatalogHealthy(page);
    await page.locator('[data-testid="site-footer"]').scrollIntoViewIfNeeded();
    await expect(page.locator('[data-testid="footer-about-link"]')).toBeVisible();
    await page.locator('[data-testid="footer-about-link"]').click();
    await expect(page).toHaveURL(/\/about/);
    await page.goto('/');
    await page.locator('[data-testid="site-footer"]').scrollIntoViewIfNeeded();
    await expect(page.locator('[data-testid="footer-developer-link"]')).toBeVisible();
    await expect(page.locator('[data-testid="footer-copyright"]')).toBeVisible();
    await assertNoHorizontalOverflow(page);
  });

  test('mobile_footer_no_overflow_at_320px', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 844 });
    await page.goto('/');
    await assertHomeCatalogHealthy(page);
    await page.locator('[data-testid="site-footer"]').scrollIntoViewIfNeeded();
    await expect(page.locator('[data-testid="footer-about-link"]')).toBeVisible();
    await assertNoHorizontalOverflow(page);
  });

  test('mobile_viewport_meta_includes_safe_area', async ({ page }) => {
    await page.goto('/');
    const viewportContent = await page.locator('meta[name="viewport"]').getAttribute('content');
    expect(viewportContent).toContain('viewport-fit=cover');
  });
});

test.describe('responsive layout tablet', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(TABLET_VIEWPORT);
  });

  test('tablet_home_catalog_and_pdp', async ({ page }) => {
    await page.goto('/');
    await assertHomeCatalogHealthy(page);
    await assertNoHorizontalOverflow(page);
    await clickProductCardToPdp(page.locator('[data-testid^="product-card-"]').first());
    await expect(page.locator('[data-testid="product-details"]')).toBeVisible();
    await assertNoHorizontalOverflow(page);
  });

  test('tablet_nav_desktop_search_absent', async ({ page }) => {
    await page.goto('/');
    await assertHomeCatalogHealthy(page);
    await expect(page.locator('[data-testid="nav-search-open"]')).toBeHidden();
    await page.locator('[data-testid="navbar-toggle"]').click();
    await expect(page.locator('[data-testid="search-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="search-overlay"]')).toHaveCount(0);
  });

  test('tablet_checkout_form_visible', async ({ page }) => {
    await loginAs(page, 'customer');
    await addFirstInStockProductToCart(page);
    await page.goto('/checkout');
    await expect(page.locator('[data-testid="checkout-form"]')).toBeVisible();
    await expect(page.locator('[data-testid="checkout-summary-card"]')).toBeVisible();
    await assertNoHorizontalOverflow(page);
  });
});
