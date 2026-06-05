/** Mobile viewport cart/checkout journeys: tests/e2e/misc/responsive-layout.e2e.test.ts */
import { test, expect } from '@playwright/test';
import {
  addFirstProductToCart,
  completeShippingStep,
  completePaymentStep,
  loginWithCredentials,
  loginAs,
  selectAppOption
} from '../fixtures/test-helpers';
import { TEST_USERS } from '../fixtures/test-users';

test.describe('checkout cart shipping payment', () => {
  test('cart_qty_shipping_payment_persisted', async ({ page }) => {
    await addFirstProductToCart(page);
    await page.goto('/cart');
    await expect(page.locator('[data-testid="cart-screen"]')).toBeVisible();

    const qtySelect = page.locator('[data-testid^="cart-qty-"]').first();
    const lineTestId = (await qtySelect.getAttribute('data-testid'))?.replace('-trigger', '') ?? '';
    await selectAppOption(page, lineTestId, '2');
    await page.locator('[data-testid="cart-checkout"]').click();

    await expect(page).toHaveURL(/auth=login/);
    await expect(page.locator('[data-testid="auth-modal"]')).toBeVisible();
    await loginWithCredentials(page, TEST_USERS.customer.email, TEST_USERS.customer.password);
    await expect(page).toHaveURL(/\/shipping/);

    await completeShippingStep(page);
    await expect(page.locator('[data-testid="payment-heading"]')).toBeVisible();

    await completePaymentStep(page);
    await expect(page.locator('[data-testid="place-order-screen"]')).toBeVisible();
    await expect(page.getByText('PayPal')).toBeVisible();
  });

  test('cart_remove_item_updates_total', async ({ page }) => {
    await loginAs(page, 'customer');
    await addFirstProductToCart(page);
    await page.goto('/cart');
    const item = page.locator('[data-testid^="cart-item-"]').first();
    await item.locator('[data-testid^="cart-remove-"]').click();
    await expect(page.locator('[data-testid="cart-empty"]')).toBeVisible();
  });

  test('empty_cart_checkout_blocked', async ({ page }) => {
    await loginAs(page, 'customer');
    await page.goto('/cart');
    await expect(page.locator('[data-testid="cart-empty"]')).toBeVisible();
    await expect(page.locator('[data-testid="cart-checkout"]')).toHaveCount(0);
  });

  test('payment_paypal_selected_persists', async ({ page }) => {
    await loginAs(page, 'customer');
    await addFirstProductToCart(page);
    await completeShippingStep(page);
    await page.locator('[data-testid="payment-method-paypal"]').check();
    await page.locator('[data-testid="payment-submit"]').click();
    await expect(page.locator('[data-testid="place-order-screen"]')).toBeVisible();
    await page.goto('/payment');
    await expect(page.locator('[data-testid="payment-method-paypal"]')).toBeChecked();
  });

  test('checkout_step_sign_up_from_shipping_breadcrumb', async ({ page }) => {
    await loginAs(page, 'customer');
    await page.goto('/shipping');
    await expect(page.locator('[data-testid="shipping-heading"]')).toBeVisible();
    const signUpHref = await page
      .locator('[data-testid="checkout-step-sign-up"]')
      .getAttribute('href');
    expect(signUpHref).toContain('auth=register');
    expect(signUpHref).toContain('redirect=%2Fshipping');
  });

  test('checkout_sign_up_honors_cart_redirect', async ({ page }) => {
    const unique = Date.now();
    const email = `checkout-signup-${unique}@example.com`;

    await addFirstProductToCart(page);
    await page.goto('/cart');
    await page.locator('[data-testid="cart-checkout"]').click();

    await expect(page).toHaveURL(/auth=login/);
    await expect(page.locator('[data-testid="auth-modal"]')).toBeVisible();
    await expect(page.locator('[data-testid="login-checkout-sign-up-hint"]')).toBeVisible();
    await page.locator('[data-testid="login-register-link"]').click();
    await expect(page).toHaveURL(/auth=register/);

    await page.locator('[data-testid="register-name"]').fill('Checkout Signup User');
    await page.locator('[data-testid="register-email"]').fill(email);
    await page.locator('[data-testid="register-password"]').fill('123456');
    await page.locator('[data-testid="register-confirm-password"]').fill('123456');
    await Promise.all([
      page.waitForResponse(
        (response) => response.url().includes('/api/users') && response.status() === 201
      ),
      page.locator('[data-testid="register-submit"]').click()
    ]);

    await expect(page).toHaveURL(/\/shipping/);
    await expect(page.locator('[data-testid="shipping-heading"]')).toBeVisible();
  });

  test('shipping_requires_all_fields', async ({ page }) => {
    await loginAs(page, 'customer');
    await page.goto('/shipping');
    await page.locator('[data-testid="shipping-address"]').fill('');
    await page.locator('[data-testid="shipping-submit"]').click();
    await expect(page.locator('[data-testid="shipping-form"]')).toBeVisible();
    await expect(page).toHaveURL(/\/shipping/);
  });
});
