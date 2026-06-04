import { test, expect } from '@playwright/test';
import { loginAsAdmin } from '../fixtures/test-helpers';

test.describe('admin orders', () => {
  test('admin_views_order_list', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/orderlist');
    await expect(page.locator('[data-testid="admin-order-list"]')).toBeVisible();
  });
});
