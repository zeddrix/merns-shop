import { test, expect } from '@playwright/test';
import { loginAs, createPaidOrderViaApi } from '../fixtures/test-helpers';
import { resetE2eDatabase } from '../fixtures/reset-db';

test.describe('order access', () => {
  test.beforeEach(async ({ context }) => {
    await resetE2eDatabase(context);
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
