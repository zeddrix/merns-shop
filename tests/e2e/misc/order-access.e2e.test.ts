import { test, expect } from '@playwright/test';
import {
  assertGuestDeepLinkAuthGate,
  createPaidOrderViaApi,
  loginAs,
  loginWithCredentials
} from '../fixtures/test-helpers';
import { resetE2eDatabase } from '../fixtures/reset-db';
import { TEST_USERS } from '../fixtures/test-users';

const PLACEHOLDER_ORDER_ID = '507f1f77bcf86cd799439011';

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
});
