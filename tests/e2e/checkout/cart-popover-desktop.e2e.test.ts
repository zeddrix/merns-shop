import { test, expect } from '@playwright/test';
import {
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

  test('guest_popover_checkout_login_lands_on_shipping', async ({ page }) => {
    await openProductByExactName(page, 'iPhone 15 Pro');
    await selectVariantAndAddToCart(page);

    await page.locator('[data-testid="nav-cart"]').click();
    await page.locator('[data-testid="cart-popover-checkout"]').click();

    await expect(page).toHaveURL(/\/product\/.*auth=login/);
    await expect(page.locator('[data-testid="auth-modal"]')).toBeVisible();
    await loginWithCredentials(page, TEST_USERS.customer.email, TEST_USERS.customer.password);
    await expect(page).toHaveURL(/\/shipping/);
    await expect(page.locator('[data-testid="shipping-heading"]')).toBeVisible();
  });
});
