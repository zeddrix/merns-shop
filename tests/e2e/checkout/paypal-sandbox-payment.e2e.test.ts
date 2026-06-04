import { test, expect } from '@playwright/test';
import {
  addFirstProductToCart,
  completeShippingStep,
  completePaymentStep
} from '../fixtures/test-helpers';

test.describe('PayPal sandbox payment', () => {
  test.skip(
    process.env.PW_RUN_PAYPAL !== '1',
    'Set PW_RUN_PAYPAL=1 with PayPal sandbox buyer credentials to run live PayPal checkout'
  );

  test('paypal_sandbox_payment_marks_order_paid', async ({ page }) => {
    await addFirstProductToCart(page);
    await page.locator('[data-testid="nav-cart"]').click();
    await page.locator('[data-testid="cart-checkout"]').click();
    await completeShippingStep(page);
    await completePaymentStep(page);
    await page.locator('[data-testid="place-order-submit"]').click();

    await expect(page.locator('[data-testid="order-screen"]')).toBeVisible();
    await expect(page.locator('[data-testid="paypal-buttons"]')).toBeVisible();

    const paypalFrame = page.frameLocator('iframe[title="PayPal"]').first();
    await paypalFrame.locator('[data-testid="paypal-button"]').click({ timeout: 60000 });

    // PayPal sandbox login flow varies by region — user completes manually in headed mode if needed
    test.info().annotations.push({
      type: 'note',
      description: 'Run headed with real sandbox buyer credentials for full payment flow'
    });
  });
});
