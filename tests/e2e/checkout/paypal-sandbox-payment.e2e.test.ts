import { test, expect } from '@playwright/test';
import {
  addFirstProductToCart,
  completeShippingStep,
  completePaymentStep,
  loginWithCredentials
} from '../fixtures/test-helpers';
import { TEST_USERS } from '../fixtures/test-users';
import { completePayPalSandboxPayment } from '../fixtures/paypal-helpers';
import { findOrderById } from '../fixtures/mongo-helpers';
import { resetE2eDatabase } from '../fixtures/reset-db';
import { shouldRunPayPalE2e, payPalSkipReason } from '../fixtures/paypal-env';

test.describe('PayPal sandbox payment', () => {
  test.describe.configure({ timeout: 240_000 });

  test.skip(!shouldRunPayPalE2e(), payPalSkipReason);

  test.beforeEach(async ({ context }) => {
    await resetE2eDatabase(context);
  });

  test('paypal_sandbox_payment_marks_order_paid', async ({ page }) => {
    await addFirstProductToCart(page);
    await page.goto('/cart');
    await page.locator('[data-testid="cart-checkout"]').click();
    await expect(page).toHaveURL(/auth=login/);
    await expect(page.locator('[data-testid="auth-modal"]')).toBeVisible();
    await loginWithCredentials(page, TEST_USERS.customer.email, TEST_USERS.customer.password);
    await completeShippingStep(page);
    await completePaymentStep(page);

    await Promise.all([
      page.waitForResponse(
        (response) => response.url().includes('/api/orders') && response.status() === 201
      ),
      page.locator('[data-testid="place-order-submit"]').click()
    ]);

    await expect(page.locator('[data-testid="order-screen"]')).toBeVisible();
    await page.reload();
    await expect(page.locator('[data-testid="order-screen"]')).toBeVisible();
    const orderId = page.url().split('/order/')[1]?.split(/[/?#]/)[0];
    expect(orderId).toBeTruthy();

    await completePayPalSandboxPayment(page);
    await expect(page.locator('[data-testid="order-paid-message"]')).toBeVisible();

    const dbOrder = await findOrderById(orderId as string);
    expect(dbOrder?.isPaid).toBe(true);
  });
});
