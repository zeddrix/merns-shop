import { test, expect } from '@playwright/test';
import { loginAs, logout } from '../fixtures/test-helpers';
import { resetE2eDatabase } from '../fixtures/reset-db';
import { TEST_USERS } from '../fixtures/test-users';

test.describe('auth login register profile', () => {
  test.beforeEach(async ({ context }) => {
    await resetE2eDatabase(context);
  });

  test('login_wrong_password_shows_error', async ({ page }) => {
    await page.goto('/login');
    await page.locator('[data-testid="login-email"]').fill(TEST_USERS.customer.email);
    await page.locator('[data-testid="login-password"]').fill('wrong-password');
    await Promise.all([
      page.waitForResponse(
        (response) => response.url().includes('/api/users/login') && response.status() === 401
      ),
      page.locator('[data-testid="login-submit"]').click()
    ]);
    await expect(page.locator('[data-testid="login-form"]')).toBeVisible();
    await expect(page.locator('[data-testid="nav-login"]')).toBeVisible();
  });

  test('register_validation_requires_matching_passwords', async ({ page }) => {
    await page.goto('/register');
    await page.locator('[data-testid="register-name"]').fill('Invalid User');
    await page.locator('[data-testid="register-email"]').fill('invalid@example.com');
    await page.locator('[data-testid="register-password"]').fill('123456');
    await page.locator('[data-testid="register-confirm-password"]').fill('654321');
    await page.locator('[data-testid="register-submit"]').click();
    await expect(page.locator('[data-testid="register-form"]')).toBeVisible();
    await expect(page.locator('[data-testid="nav-login"]')).toBeVisible();
  });

  test('login_does_not_store_userInfo_in_localStorage', async ({ page }) => {
    await loginAs(page, 'customer');
    const stored = await page.evaluate(() => localStorage.getItem('userInfo'));
    expect(stored).toBeNull();
  });

  test('session_persists_after_reload', async ({ page }) => {
    await loginAs(page, 'customer');
    await page.reload();
    await expect(page.locator('[data-testid="nav-login"]')).toBeHidden();
  });

  test('logout_clears_session_and_blocks_profile', async ({ page }) => {
    await loginAs(page, 'customer');
    await logout(page);
    await page.goto('/profile');
    await expect(page).toHaveURL(/\/login/);
  });

  test('register_honors_redirect_query', async ({ page }) => {
    const unique = Date.now();
    await page.goto(`/register?redirect=${encodeURIComponent('/shipping')}`);
    await page.locator('[data-testid="register-name"]').fill('Redirect User');
    await page.locator('[data-testid="register-email"]').fill(`redirect-${unique}@example.com`);
    await page.locator('[data-testid="register-password"]').fill('123456');
    await page.locator('[data-testid="register-confirm-password"]').fill('123456');
    await Promise.all([
      page.waitForResponse(
        (response) => response.url().includes('/api/users') && response.status() === 201
      ),
      page.locator('[data-testid="register-submit"]').click()
    ]);
    await expect(page).toHaveURL(/\/shipping/);
  });

  test('seeded_customer_login_shows_profile_and_orders', async ({ page }) => {
    await loginAs(page, 'customer');
    await page.goto('/profile');
    await expect(page.locator('[data-testid="profile-screen"]')).toBeVisible();
    await expect(page.locator('[data-testid="my-orders-table"]')).toBeVisible();

    await logout(page);
    await expect(page.locator('[data-testid="login-heading"]')).toBeVisible();
  });
});
