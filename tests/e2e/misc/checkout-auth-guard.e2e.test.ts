import { test, expect } from '@playwright/test';

test.describe('checkout auth guard', () => {
  test('guest_cannot_deep_link_to_placeorder', async ({ page }) => {
    await page.goto('/placeorder');
    await expect(page).toHaveURL(/\/login\?redirect=/);
    await expect(page.locator('[data-testid="login-heading"]')).toBeVisible();
  });

  test('guest_cannot_deep_link_to_shipping', async ({ page }) => {
    await page.goto('/shipping');
    await expect(page).toHaveURL(/\/login\?redirect=/);
    await expect(page.locator('[data-testid="login-heading"]')).toBeVisible();
  });

  test('profile_requires_login', async ({ page }) => {
    await page.goto('/profile');
    await expect(page).toHaveURL(/\/login\?redirect=/);
    await expect(page.locator('[data-testid="login-heading"]')).toBeVisible();
  });
});
