import { test, expect } from '@playwright/test';
import {
  loginAs,
  loginAsAdmin,
  createPaidOrderViaApi,
  createUnpaidOrderViaApi
} from '../fixtures/test-helpers';
import { resetE2eDatabase } from '../fixtures/reset-db';
import { findOrderById } from '../fixtures/mongo-helpers';

test.describe('admin orders', () => {
  test.beforeEach(async ({ context }) => {
    await resetE2eDatabase(context);
  });

  test('admin_views_order_list', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/orderlist');
    await expect(page.locator('[data-testid="admin-order-list"]')).toBeVisible();
  });

  test('non_admin_blocked_from_admin_order_routes', async ({ page }) => {
    await loginAs(page, 'customer');
    await page.goto('/admin/orderlist');
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator('[data-testid="admin-order-list"]')).toHaveCount(0);
  });

  test('admin_marks_paid_order_delivered', async ({ page }) => {
    const orderId = await createPaidOrderViaApi(page);

    await loginAsAdmin(page);
    await page.goto(`/order/${orderId}`);
    await expect(page.locator('[data-testid="order-deliver"]')).toBeVisible();

    await Promise.all([
      page.waitForResponse(
        (response) => response.url().includes('/deliver') && response.status() === 200
      ),
      page.locator('[data-testid="order-deliver"]').click()
    ]);

    await expect(page.locator('[data-testid="order-delivered-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="order-deliver"]')).toBeHidden();

    const dbOrder = await findOrderById(orderId);
    expect(dbOrder?.isDelivered).toBe(true);
  });

  test('admin_unpaid_order_hides_deliver_button', async ({ page }) => {
    const orderId = await createUnpaidOrderViaApi(page, 'customer');
    const dbOrder = await findOrderById(orderId);
    expect(dbOrder).not.toBeNull();

    await loginAsAdmin(page);
    await Promise.all([
      page.waitForResponse(
        (response) =>
          response.url().includes(`/api/orders/${orderId}`) &&
          response.request().method() === 'GET' &&
          response.ok()
      ),
      page.goto(`/order/${orderId}`)
    ]);
    await expect(page.locator('[data-testid="order-screen"]')).toBeVisible();
    await expect(page.locator('[data-testid="order-deliver"]')).toHaveCount(0);
  });

  test('admin_order_list_details_link', async ({ page }) => {
    const orderId = await createPaidOrderViaApi(page, 'customer');
    const dbOrder = await findOrderById(orderId);
    expect(dbOrder).not.toBeNull();

    await loginAsAdmin(page);
    await page.goto('/admin/orderlist');
    await expect(page.locator('[data-testid="admin-order-list"]')).toBeVisible();
    await page.waitForResponse(
      (response) =>
        response.url().endsWith('/api/orders') &&
        response.request().method() === 'GET' &&
        response.ok()
    );
    await expect(page.locator(`[data-testid="admin-order-${orderId}"]`)).toBeVisible();
    await page.locator(`[data-testid="admin-order-details-${orderId}"]`).click();
    await expect(page).toHaveURL(new RegExp(`/order/${orderId}$`));
    await expect(page.locator('[data-testid="order-screen"]')).toBeVisible();
    await expect(page.locator('[data-testid="order-paid-message"]')).toBeVisible();
  });
});
