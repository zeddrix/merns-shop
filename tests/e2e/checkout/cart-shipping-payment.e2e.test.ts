import { test, expect } from '@playwright/test';
import {
  addFirstProductToCart,
  completeShippingStep,
  completePaymentStep
} from '../fixtures/test-helpers';

test.describe('checkout cart shipping payment', () => {
  test('cart_qty_shipping_payment_persisted', async ({ page }) => {
    await addFirstProductToCart(page);
    await page.locator('[data-testid="nav-cart"]').click();
    await expect(page.locator('[data-testid="cart-screen"]')).toBeVisible();

    const qtySelect = page.locator('[data-testid^="cart-qty-"]').first();
    await qtySelect.selectOption('2');
    await page.locator('[data-testid="cart-checkout"]').click();

    await completeShippingStep(page);
    await expect(page.locator('[data-testid="payment-heading"]')).toBeVisible();

    await completePaymentStep(page);
    await expect(page.locator('[data-testid="place-order-screen"]')).toBeVisible();
    await expect(page.getByText('PayPal')).toBeVisible();
  });
});
