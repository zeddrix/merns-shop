import { test, expect } from '@playwright/test';
import {
  loginAs,
  addFirstProductToCart,
  completeShippingStep,
  completePaymentStep
} from '../fixtures/test-helpers';

test.describe('journey guest purchase lifecycle', () => {
  test('customer_completes_checkout_to_order_screen', async ({ page }) => {
    await loginAs(page, 'customer');
    await addFirstProductToCart(page);
    await page.locator('[data-testid="nav-cart"]').click();
    await page.locator('[data-testid="cart-checkout"]').click();
    await completeShippingStep(page);
    await completePaymentStep(page);
    await Promise.all([
      page.waitForResponse(
        (response) => response.url().includes('/api/orders') && response.status() === 201
      ),
      page.locator('[data-testid="place-order-submit"]').click()
    ]);

    await expect(page.locator('[data-testid="order-screen"]')).toBeVisible();
    await expect(page.locator('[data-testid="order-heading"]')).toBeVisible();
  });
});
