import { test, expect } from '@playwright/test';
import {
  addFirstProductToCart,
  completeShippingStep,
  completePaymentStep,
  loginWithCredentials
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
});
