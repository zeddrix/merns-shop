import { test, expect } from '@playwright/test';
import { loginAs, loginAsAdmin, createPaidOrderViaApi } from '../fixtures/test-helpers';
import { resetE2eDatabase } from '../fixtures/reset-db';
import { findOrderById } from '../fixtures/mongo-helpers';

test.describe('journey admin order fulfillment', () => {
  test.beforeEach(async () => {
    await resetE2eDatabase();
  });

  test('admin_delivers_paid_order_and_customer_sees_delivery', async ({ page }) => {
    const orderId = await createPaidOrderViaApi(page);

    await loginAsAdmin(page);
    await page.goto('/admin/orderlist');
    await expect(page.locator(`[data-testid="admin-order-${orderId}"]`)).toBeVisible();
    await page.locator(`[data-testid="admin-order-details-${orderId}"]`).click();

    await Promise.all([
      page.waitForResponse(
        (response) => response.url().includes('/deliver') && response.status() === 200
      ),
      page.locator('[data-testid="order-deliver"]').click()
    ]);
    await expect(page.locator('[data-testid="order-delivered-message"]')).toBeVisible();

    await page.evaluate(() => localStorage.removeItem('userInfo'));
    await loginAs(page, 'customer');
    await page.goto('/profile');
    await expect(page.locator('[data-testid="my-orders-table"]')).toBeVisible();
    await expect(page.locator(`[data-testid="my-order-${orderId}"]`)).toBeVisible();
    await expect(page.locator(`[data-testid="my-order-delivered-${orderId}"]`)).toHaveText(
      /\d{4}-\d{2}-\d{2}/
    );

    const dbOrder = await findOrderById(orderId);
    expect(dbOrder?.isDelivered).toBe(true);
  });
});
