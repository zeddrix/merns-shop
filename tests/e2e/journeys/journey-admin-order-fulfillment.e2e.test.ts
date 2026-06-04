import { test, expect } from '@playwright/test';
import { loginAsAdmin } from '../fixtures/test-helpers';

test.describe('journey admin order fulfillment', () => {
  test('admin_can_open_order_list', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/orderlist');
    await expect(page.locator('[data-testid="admin-order-list"]')).toBeVisible();
  });
});
