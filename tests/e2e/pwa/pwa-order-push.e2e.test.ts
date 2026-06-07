import { test, expect } from '@playwright/test';
import { TEST_USERS } from '../fixtures/test-users';
import {
  createUnpaidOrderViaApi,
  deliverOrderViaApi,
  payOrderViaApi,
  tryEnsureRealPushSubscription
} from '../fixtures/test-helpers';
import {
  clearPushSubscriptions,
  findNotificationsByUserId,
  findUserByEmail,
  seedPushSubscription
} from '../fixtures/mongo-helpers';
import { E2E_VAPID_PUBLIC_KEY } from '../fixtures/e2e-vapid-keys';
import { initSWAndLogin, waitForSWAndCaching } from './pwa-test-helpers';

test.describe.configure({ timeout: 120000 });

test.describe('Order push notifications (production build)', () => {
  test.beforeEach(async () => {
    const user = await findUserByEmail(TEST_USERS.customer.email);
    if (user?._id) {
      await clearPushSubscriptions(String(user._id));
    }
  });

  test('pwa_order_paid_push', async ({ page }) => {
    await initSWAndLogin(page, TEST_USERS.customer.email, TEST_USERS.customer.password);

    const user = await findUserByEmail(TEST_USERS.customer.email);
    expect(user?._id).toBeTruthy();

    const subscribed = await tryEnsureRealPushSubscription(page, E2E_VAPID_PUBLIC_KEY);
    if (!subscribed) {
      await seedPushSubscription(String(user?._id), `https://e2e.example/push/${Date.now()}`);
    } else {
      await page.goto('/profile');
      await page.locator('[data-testid="push-settings-enabled"]').check();
      await Promise.all([
        page.waitForResponse(
          (response) =>
            response.url().includes('/api/push/preferences') &&
            response.request().method() === 'PUT' &&
            response.ok()
        ),
        page.locator('[data-testid="push-settings-save"]').click()
      ]);
    }

    const orderId = await createUnpaidOrderViaApi(page, 'customer', false);
    await payOrderViaApi(page, orderId, 'customer');

    await page.goto('/profile');
    await waitForSWAndCaching(page);
    await Promise.all([
      page.waitForResponse(
        (response) =>
          response.url().includes('/api/push/notifications') &&
          response.request().method() === 'GET' &&
          response.ok()
      ),
      page.locator('[data-testid="notification-bell"]').click()
    ]);
    await expect(page.locator('[data-testid="notification-list"]')).toContainText(
      'Payment confirmed'
    );

    const notifications = await findNotificationsByUserId(String(user?._id));
    expect(notifications.some((item) => item.type === 'order_paid')).toBe(true);
  });

  test('pwa_order_delivered_push', async ({ page }) => {
    await initSWAndLogin(page, TEST_USERS.customer.email, TEST_USERS.customer.password);

    const user = await findUserByEmail(TEST_USERS.customer.email);
    expect(user?._id).toBeTruthy();
    await seedPushSubscription(String(user?._id), `https://e2e.example/push/deliver/${Date.now()}`);

    const orderId = await createUnpaidOrderViaApi(page, 'customer', false);
    await payOrderViaApi(page, orderId, 'customer');
    await deliverOrderViaApi(page, orderId, false);

    await page.goto('/profile');
    await waitForSWAndCaching(page);
    await Promise.all([
      page.waitForResponse(
        (response) =>
          response.url().includes('/api/push/notifications') &&
          response.request().method() === 'GET' &&
          response.ok()
      ),
      page.locator('[data-testid="notification-bell"]').click()
    ]);
    await expect(page.locator('[data-testid="notification-list"]')).toContainText(
      'Order delivered'
    );

    const notifications = await findNotificationsByUserId(String(user?._id));
    expect(notifications.some((item) => item.type === 'order_delivered')).toBe(true);
  });
});
