import { test, expect } from '@playwright/test';

test.describe('checkout auth guard', () => {
  test('guest_cannot_deep_link_to_placeorder', async ({ page }) => {
    await page.goto('/placeorder');
    await expect(page).toHaveURL(/\/placeorder\?auth=login/);
    await expect(page.locator('[data-testid="auth-modal"]')).toBeVisible();
    await page.locator('[data-testid="auth-modal-close"]').click();
    await expect(page.locator('[data-testid="auth-modal"]')).toHaveCount(0);
    await expect(page.locator('[data-testid="nav-login"]')).toBeVisible();
  });

  test('guest_cannot_deep_link_to_shipping', async ({ page }) => {
    await page.goto('/shipping');
    await expect(page).toHaveURL(/\/shipping\?auth=login/);
    await expect(page.locator('[data-testid="auth-modal"]')).toBeVisible();
    await page.locator('[data-testid="auth-modal-close"]').click();
    await expect(page.locator('[data-testid="auth-modal"]')).toHaveCount(0);
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator('[data-testid="nav-login"]')).toBeVisible();
  });

  test('profile_requires_login', async ({ page }) => {
    await page.goto('/profile');
    await expect(page).toHaveURL(/\/profile\?auth=login/);
    await expect(page.locator('[data-testid="auth-modal"]')).toBeVisible();
    await page.locator('[data-testid="login-register-link"]').click();
    await expect(page).toHaveURL(/auth=register/);
    await expect(page.locator('[data-testid="register-heading"]')).toBeVisible();
  });
});
