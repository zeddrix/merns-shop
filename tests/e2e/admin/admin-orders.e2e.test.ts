import { test, expect } from '@playwright/test';
import { loginAsAdmin, createPaidOrderViaApi } from '../fixtures/test-helpers';
import { resetE2eDatabase } from '../fixtures/reset-db';
import { findOrderById } from '../fixtures/mongo-helpers';

test.describe('admin orders', () => {
  test.beforeEach(async () => {
    await resetE2eDatabase();
  });

  test('admin_views_order_list', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/orderlist');
    await expect(page.locator('[data-testid="admin-order-list"]')).toBeVisible();
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
});
