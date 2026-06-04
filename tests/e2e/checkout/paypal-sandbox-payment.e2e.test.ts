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

test.describe('PayPal sandbox payment', () => {
  test.skip(
    process.env.PW_RUN_PAYPAL !== '1',
    'Set PW_RUN_PAYPAL=1 with PayPal sandbox buyer credentials to run live PayPal checkout'
  );

  test.beforeEach(async () => {
    await resetE2eDatabase();
  });

  test('paypal_sandbox_payment_marks_order_paid', async ({ page }) => {
    await addFirstProductToCart(page);
    await page.locator('[data-testid="nav-cart"]').click();
    await page.locator('[data-testid="cart-checkout"]').click();
    await expect(page).toHaveURL(/\/login\?redirect=/);
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
    const orderId = page.url().split('/order/')[1]?.split(/[/?#]/)[0];
    expect(orderId).toBeTruthy();

    await completePayPalSandboxPayment(page);
    await expect(page.locator('[data-testid="order-paid-message"]')).toBeVisible();

    const dbOrder = await findOrderById(orderId as string);
    expect(dbOrder?.isPaid).toBe(true);
  });
});
