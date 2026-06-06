import { test, expect } from '@playwright/test';

test.describe('checkout auth guard', () => {
  test('guest_cannot_deep_link_to_placeorder', async ({ page }) => {
    await page.goto('/placeorder');
    await expect(page).toHaveURL(/\/placeorder\?auth=login/);
    await expect(page.locator('[data-testid="auth-modal"]')).toBeVisible();
    await page.locator('[data-testid="auth-modal-close"]').click();
    await expect(page.locator('[data-testid="auth-modal"]')).toHaveCount(0);
    await expect(page).toHaveURL(/\/placeorder$/);
    await expect(page.locator('[data-testid="auth-gate"]')).toBeVisible();
    await expect(page.locator('[data-testid="nav-login"]')).toBeVisible();
  });

  test('guest_cannot_deep_link_to_shipping', async ({ page }) => {
    await page.goto('/shipping');
    await expect(page).toHaveURL(/\/shipping\?auth=login/);
    await expect(page.locator('[data-testid="auth-modal"]')).toBeVisible();
    await page.locator('[data-testid="auth-modal-close"]').click();
    await expect(page.locator('[data-testid="auth-modal"]')).toHaveCount(0);
    await expect(page).toHaveURL(/\/shipping$/);
    await expect(page.locator('[data-testid="auth-gate"]')).toBeVisible();
    await expect(page.locator('[data-testid="nav-login"]')).toBeVisible();
    await page.locator('[data-testid="auth-gate-sign-in"]').click();
    await expect(page).toHaveURL(/\/shipping\?auth=login/);
    await expect(page.locator('[data-testid="auth-modal"]')).toBeVisible();
  });

  test('guest_cannot_deep_link_to_payment', async ({ page }) => {
    await page.goto('/payment');
    await expect(page).toHaveURL(/\/payment\?auth=login/);
    await expect(page.locator('[data-testid="auth-modal"]')).toBeVisible();
    await page.locator('[data-testid="auth-modal-close"]').click();
    await expect(page.locator('[data-testid="auth-modal"]')).toHaveCount(0);
    await expect(page).toHaveURL(/\/payment$/);
    await expect(page.locator('[data-testid="auth-gate"]')).toBeVisible();
  });

  test('profile_auth_gate_after_modal_dismiss', async ({ page }) => {
    await page.goto('/profile');
    await expect(page).toHaveURL(/\/profile\?auth=login/);
    await expect(page.locator('[data-testid="auth-modal"]')).toBeVisible();
    await page.locator('[data-testid="auth-modal-close"]').click();
    await expect(page.locator('[data-testid="auth-modal"]')).toHaveCount(0);
    await expect(page).toHaveURL(/\/profile$/);
    await expect(page.locator('[data-testid="auth-gate"]')).toBeVisible();
  });

  test('profile_requires_login', async ({ page }) => {
    await page.goto('/profile');
    await expect(page).toHaveURL(/\/profile\?auth=login/);
    await expect(page.locator('[data-testid="auth-modal"]')).toBeVisible();
    await page.locator('[data-testid="login-register-link"]').click();
    await expect(page.locator('[data-testid="register-heading"]')).toBeVisible();
    await expect(page.locator('[data-testid="auth-modal"]')).toBeVisible();
  });
});
