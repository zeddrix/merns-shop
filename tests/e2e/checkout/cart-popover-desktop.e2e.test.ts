import { test, expect } from '@playwright/test';
import {
  loginAs,
  loginWithCredentials,
  openProductByExactName,
  selectVariantAndAddToCart
} from '../fixtures/test-helpers';
import { TEST_USERS } from '../fixtures/test-users';

test.describe('desktop cart popover', () => {
  test.use({ viewport: { width: 1280, height: 720 } });

  test('desktop_cart_popover_lists_items', async ({ page }) => {
    await openProductByExactName(page, 'iPhone 15 Pro');
    await selectVariantAndAddToCart(page);

    await page.locator('[data-testid="nav-cart"]').click();
    await expect(page).not.toHaveURL(/\/cart/);
    await expect(page.locator('[data-testid="cart-popover"]')).toBeVisible();
    await expect(page.locator('[data-testid="cart-popover-checkout"]')).toBeVisible();
    await expect(page.locator('[data-testid="cart-popover"]')).toContainText('iPhone 15 Pro');

    await page.locator('[data-testid="cart-popover"] a').first().click();
    await expect(page.locator('[data-testid="product-details"]')).toBeVisible();
    await expect(page.locator('[data-testid="product-add-cart"]')).toBeVisible();
  });

  test('guest_popover_checkout_opens_auth_on_current_page', async ({ page }) => {
    await openProductByExactName(page, 'iPhone 15 Pro');
    await selectVariantAndAddToCart(page);

    await page.locator('[data-testid="nav-cart"]').click();
    await expect(page).toHaveURL(/\/product\//);
    await page.locator('[data-testid="cart-popover-checkout"]').click();

    await expect(page).toHaveURL(/\/product\/.*auth=login/);
    await expect(page).not.toHaveURL(/^https?:\/\/[^/]+\/?(\?|$)/);
    await expect(page.locator('[data-testid="auth-modal"]')).toBeVisible();
    await expect(page.locator('[data-testid="login-checkout-sign-up-hint"]')).toBeVisible();
  });

  test('guest_popover_checkout_login_lands_on_checkout', async ({ page }) => {
    await openProductByExactName(page, 'iPhone 15 Pro');
    await selectVariantAndAddToCart(page);

    await page.locator('[data-testid="nav-cart"]').click();
    await page.locator('[data-testid="cart-popover-checkout"]').click();

    await expect(page).toHaveURL(/\/product\/.*auth=login/);
    await expect(page.locator('[data-testid="auth-modal"]')).toBeVisible();
    await loginWithCredentials(page, TEST_USERS.customer.email, TEST_USERS.customer.password);
    await expect(page).toHaveURL(/\/checkout/);
    await expect(page.locator('[data-testid="checkout-heading"]')).toBeVisible();
  });

  test('logged_in_popover_checkout_skips_auth_modal', async ({ page }) => {
    await loginAs(page, 'customer');
    await expect(page.locator('[data-testid="nav-login"]')).toBeHidden();
    await openProductByExactName(page, 'iPhone 15 Pro');
    await selectVariantAndAddToCart(page);

    await page.locator('[data-testid="nav-cart"]').click();
    await expect(page.locator('[data-testid="cart-popover"]')).toBeVisible();
    await page.locator('[data-testid="cart-popover-checkout"]').click();

    await expect(page).toHaveURL(/\/checkout/);
    await expect(page.locator('[data-testid="checkout-heading"]')).toBeVisible();
    await expect(page.locator('[data-testid="auth-modal"]')).toHaveCount(0);
  });

  test('empty_cart_popover_shows_empty_state', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-testid="nav-cart"]').click();
    await expect(page).not.toHaveURL(/\/cart/);
    await expect(page.locator('[data-testid="cart-popover"]')).toBeVisible();
    await expect(page.locator('[data-testid="cart-popover-empty"]')).toBeVisible();
    await expect(page.locator('[data-testid="cart-popover-checkout"]')).toHaveCount(0);
  });

  test('cart_popover_uses_dark_panel', async ({ page }) => {
    await loginAs(page, 'customer');
    await openProductByExactName(page, 'iPhone 15 Pro');
    await selectVariantAndAddToCart(page);
    await page.locator('[data-testid="nav-cart"]').click();
    await expect(page.locator('[data-testid="cart-popover"]')).toHaveClass(/header-panel-dark/);
  });

  test('popover_shows_to_pay_items_with_badge', async ({ page }) => {
    await loginAs(page, 'customer');
    await openProductByExactName(page, 'iPhone 15 Pro');
    await selectVariantAndAddToCart(page);
    await page.goto('/checkout');
    await page.locator('[data-testid="checkout-address"]').fill('123 Test St');
    await page.locator('[data-testid="checkout-city"]').fill('Testville');
    await page.locator('[data-testid="checkout-postal-code"]').fill('12345');
    const { selectAppOption } = await import('../fixtures/test-helpers');
    await selectAppOption(page, 'checkout-country', 'United States', 'united');
    await Promise.all([
      page.waitForResponse(
        (response) => response.url().includes('/api/orders') && response.status() === 201
      ),
      page.locator('[data-testid="checkout-place-order-submit"]').click()
    ]);
    await page.locator('[data-testid="nav-cart"]').click();
    await expect(page.locator('[data-testid="cart-item-to-pay-badge"]')).toBeVisible();
    await expect(page.locator('[data-testid="cart-popover-checkout"]')).toHaveCount(0);
  });
});
