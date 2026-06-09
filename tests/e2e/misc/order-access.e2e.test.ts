import { test, expect } from '@playwright/test';
import {
  assertGuestDeepLinkAuthGate,
  createPaidOrderViaApi,
  createUnpaidOrderViaApi,
  deliverOrderViaApi,
  loginAs,
  loginWithCredentials
} from '../fixtures/test-helpers';
import { waitForPayPalButtonsReady } from '../fixtures/paypal-helpers';
import { shouldRunPayPalE2e, payPalSkipReason } from '../fixtures/paypal-env';
import { resetE2eDatabase } from '../fixtures/reset-db';
import { TEST_USERS } from '../fixtures/test-users';

const PLACEHOLDER_ORDER_ID = '507f1f77bcf86cd799439011';
const INVALID_ORDER_ID = '000000000000000000000000';

test.describe('order access', () => {
  test.beforeEach(async ({ context }) => {
    await resetE2eDatabase(context);
  });

  test('guest_order_deep_link_shows_auth_gate_after_dismiss', async ({ page }) => {
    await assertGuestDeepLinkAuthGate(page, `/order/${PLACEHOLDER_ORDER_ID}`);
    await expect(page.locator('[data-testid="auth-gate"]')).toContainText(
      'Sign in to view your order'
    );
  });

  test('guest_order_gate_sign_in_views_own_order', async ({ page }) => {
    const orderId = await createPaidOrderViaApi(page, 'customer');

    await assertGuestDeepLinkAuthGate(page, `/order/${orderId}`, { reopenSignIn: true });
    await loginWithCredentials(page, TEST_USERS.customer.email, TEST_USERS.customer.password);
    await expect(page).toHaveURL(new RegExp(`/order/${orderId}$`));
    await expect(page.locator('[data-testid="order-screen"]')).toBeVisible();
    await expect(page.locator('[data-testid="order-heading"]')).toBeVisible();
  });

  test('customer_views_own_order_detail', async ({ page }) => {
    const orderId = await createPaidOrderViaApi(page, 'customer');
    await loginAs(page, 'customer');
    await page.goto(`/order/${orderId}`);
    await expect(page.locator('[data-testid="order-screen"]')).toBeVisible();
    await expect(page.locator('[data-testid="order-heading"]')).toBeVisible();
    await expect(page.locator('[data-testid="order-details-error"]')).toHaveCount(0);
  });

  test('customer_cannot_view_other_users_order_in_ui', async ({ page }) => {
    const orderId = await createPaidOrderViaApi(page, 'customer');
    await loginAs(page, 'jane');
    await page.goto(`/order/${orderId}`);
    await expect(page.locator('[data-testid="order-details-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="order-details-error"]')).toContainText(
      /not authorized/i
    );
  });

  test('profile_my_order_details_opens_order_screen', async ({ page }) => {
    const orderId = await createPaidOrderViaApi(page, 'customer');
    await loginAs(page, 'customer');
    await page.goto('/profile');
    await expect(page.locator('[data-testid="profile-screen"]')).toBeVisible();
    await expect(page.locator(`[data-testid="my-order-${orderId}"]`)).toBeVisible();
    await page.locator(`[data-testid="my-order-details-${orderId}"]`).click();
    await expect(page).toHaveURL(new RegExp(`/order/${orderId}$`));
    await expect(page.locator('[data-testid="order-screen"]')).toBeVisible();
    await expect(page.locator('[data-testid="order-heading"]')).toBeVisible();
  });

  test('authenticated_invalid_order_id_shows_error', async ({ page }) => {
    await loginAs(page, 'customer');
    await page.goto(`/order/${INVALID_ORDER_ID}`);
    await expect(page.locator('[data-testid="order-details-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="order-details-error"]')).toContainText(
      /order not found/i
    );
  });

  test('customer_paid_order_shows_summary_and_paid_message', async ({ page }) => {
    const orderId = await createPaidOrderViaApi(page, 'customer');
    await loginAs(page, 'customer');
    await page.goto(`/order/${orderId}`);
    await expect(page.locator('[data-testid="order-screen"]')).toBeVisible();
    await expect(page.locator('[data-testid="order-summary"]')).toBeVisible();
    await expect(page.locator('[data-testid="order-items"]')).toBeVisible();
    await expect(page.locator('[data-testid="order-payment"]')).toBeVisible();
    await expect(page.locator('[data-testid="order-shipping"]')).toBeVisible();
    const itemsBox = await page.locator('[data-testid="order-items"]').boundingBox();
    const paymentBox = await page.locator('[data-testid="order-payment"]').boundingBox();
    const shippingBox = await page.locator('[data-testid="order-shipping"]').boundingBox();
    expect(itemsBox!.y).toBeLessThan(paymentBox!.y);
    expect(paymentBox!.y).toBeLessThan(shippingBox!.y);
    await expect(page.locator('[data-testid="order-line-qty-price"]')).toHaveCount(1);
    await expect(page.locator('[data-testid="order-shipping"]')).toContainText('123 Test St');
    await expect(page.locator('[data-testid="order-paid-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="order-not-delivered-message"]')).toBeVisible();
  });

  test('customer_delivered_order_shows_delivered_message', async ({ page }) => {
    const orderId = await createPaidOrderViaApi(page, 'customer');
    await deliverOrderViaApi(page, orderId);

    await loginAs(page, 'customer');
    await page.goto(`/order/${orderId}`);
    await expect(page.locator('[data-testid="order-screen"]')).toBeVisible();
    await expect(page.locator('[data-testid="order-delivered-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="order-not-delivered-message"]')).toHaveCount(0);
  });

  test('customer_unpaid_order_shows_paypal_buttons', async ({ page }) => {
    test.skip(!shouldRunPayPalE2e(), payPalSkipReason);

    const orderId = await createUnpaidOrderViaApi(page, 'customer');
    await loginAs(page, 'customer');
    await page.goto(`/order/${orderId}`);
    await expect(page.locator('[data-testid="order-screen"]')).toBeVisible();
    await waitForPayPalButtonsReady(page);
    await expect(
      page.locator('[data-testid="paypal-buttons-ready"], [data-testid="paypal-buttons"]').first()
    ).toBeVisible();
  });

  test('customer_paid_order_hides_paypal_buttons', async ({ page }) => {
    const orderId = await createPaidOrderViaApi(page, 'customer');
    await loginAs(page, 'customer');
    await page.goto(`/order/${orderId}`);
    await expect(page.locator('[data-testid="order-screen"]')).toBeVisible();
    await expect(page.locator('[data-testid="order-paid-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="paypal-buttons"]')).toHaveCount(0);
    await expect(page.locator('[data-testid="paypal-buttons-ready"]')).toHaveCount(0);
  });
});
