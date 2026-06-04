import { test, expect } from '@playwright/test';
import {
  addFirstProductToCart,
  completeShippingStep,
  completePaymentStep,
  loginWithCredentials,
  loginAs
} from '../fixtures/test-helpers';
import { TEST_USERS } from '../fixtures/test-users';

test.describe('checkout cart shipping payment', () => {
  test('cart_qty_shipping_payment_persisted', async ({ page }) => {
    await addFirstProductToCart(page);
    await page.locator('[data-testid="nav-cart"]').click();
    await expect(page.locator('[data-testid="cart-screen"]')).toBeVisible();

    const qtySelect = page.locator('[data-testid^="cart-qty-"]').first();
    await qtySelect.selectOption('2');
    await page.locator('[data-testid="cart-checkout"]').click();

    await expect(page).toHaveURL(/\/login\?redirect=/);
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
    await page.locator('[data-testid="nav-cart"]').click();
    const item = page.locator('[data-testid^="cart-item-"]').first();
    const productId = (await item.getAttribute('data-testid'))?.replace('cart-item-', '');
    await page.locator(`[data-testid="cart-remove-${productId}"]`).click();
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

  test('shipping_requires_all_fields', async ({ page }) => {
    await loginAs(page, 'customer');
    await page.goto('/shipping');
    await page.locator('[data-testid="shipping-address"]').fill('');
    await page.locator('[data-testid="shipping-submit"]').click();
    await expect(page.locator('[data-testid="shipping-form"]')).toBeVisible();
    await expect(page).toHaveURL(/\/shipping/);
  });
});
