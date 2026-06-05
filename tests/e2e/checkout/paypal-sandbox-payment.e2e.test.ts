import { test, expect } from '@playwright/test';
import { guestCheckoutPlaceUnpaidOrder } from '../fixtures/test-helpers';
import {
  completePayPalSandboxPayment,
  waitForPayPalButtonsReady
} from '../fixtures/paypal-helpers';
import { findOrderById } from '../fixtures/mongo-helpers';
import { resetE2eDatabase } from '../fixtures/reset-db';
import { shouldRunPayPalE2e, payPalSkipReason } from '../fixtures/paypal-env';

test.describe('PayPal sandbox payment', () => {
  test.describe.configure({ timeout: 240_000, mode: 'serial' });

  test.skip(!shouldRunPayPalE2e(), payPalSkipReason);

  test.beforeEach(async ({ context }) => {
    await resetE2eDatabase(context);
  });

  test('paypal_sandbox_payment_marks_order_paid', { tag: '@paypal' }, async ({ page }) => {
    const orderId = await guestCheckoutPlaceUnpaidOrder(page);
    await waitForPayPalButtonsReady(page);
    await expect(page.locator('[data-testid="paypal-buttons-ready"]')).toBeVisible();
    await completePayPalSandboxPayment(page);
    await expect(page.locator('[data-testid="order-paid-message"]')).toBeVisible();

    const dbOrder = await findOrderById(orderId);
    expect(dbOrder?.isPaid).toBe(true);
  });
});
