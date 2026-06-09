import { test, expect } from '@playwright/test';
import { loginAs } from '../fixtures/test-helpers';

test.describe('notification popover', () => {
  test('notification_popover_opens_from_navbar', async ({ page }) => {
    await loginAs(page, 'customer');
    await page.goto('/');
    await page.locator('[data-testid="notification-bell"]').click();
    await expect(page.locator('[data-testid="notification-popover"]')).toBeVisible();
    await expect(page.locator('[data-testid="notification-list"]')).toBeVisible();
    await page.locator('[data-testid="site-brand"]').click();
    await expect(page.locator('[data-testid="notification-popover"]')).toHaveCount(0);
  });

  test('notification_popover_uses_dark_panel', async ({ page }) => {
    await loginAs(page, 'customer');
    await page.goto('/');
    await page.locator('[data-testid="notification-bell"]').click();
    await expect(page.locator('[data-testid="notification-popover"]')).toHaveClass(
      /header-panel-dark/
    );
  });
});
