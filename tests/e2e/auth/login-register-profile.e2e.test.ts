import { test, expect } from '@playwright/test';
import { loginAs, logout } from '../fixtures/test-helpers';
import { resetE2eDatabase } from '../fixtures/reset-db';

test.describe('auth login register profile', () => {
  test.beforeEach(async () => {
    await resetE2eDatabase();
  });
  test('register_login_profile_update', async ({ page }) => {
    const unique = Date.now();
    const email = `e2e-user-${unique}@example.com`;

    await page.goto('/register');
    await page.locator('[data-testid="register-name"]').fill('E2E User');
    await page.locator('[data-testid="register-email"]').fill(email);
    await page.locator('[data-testid="register-password"]').fill('123456');
    await page.locator('[data-testid="register-confirm-password"]').fill('123456');
    await Promise.all([
      page.waitForResponse(
        (response) => response.url().includes('/api/users') && response.status() === 201
      ),
      page.locator('[data-testid="register-submit"]').click()
    ]);

    await logout(page);

    await page.locator('[data-testid="login-email"]').fill(email);
    await page.locator('[data-testid="login-password"]').fill('123456');
    await Promise.all([
      page.waitForResponse(
        (response) => response.url().includes('/api/users/login') && response.status() === 200
      ),
      page.locator('[data-testid="login-submit"]').click()
    ]);

    await page.goto('/profile');
    await expect(page.locator('[data-testid="profile-screen"]')).toBeVisible();

    await page.locator('[data-testid="profile-name"]').fill('Updated E2E User');
    await Promise.all([
      page.waitForResponse(
        (response) => response.url().includes('/api/users/profile') && response.status() === 200
      ),
      page.locator('[data-testid="profile-submit"]').click()
    ]);
    await expect(page.getByText('Profile Updated')).toBeVisible();
  });

  test('seeded_customer_login_shows_profile', async ({ page }) => {
    await loginAs(page, 'customer');
    await page.goto('/profile');
    await expect(page.locator('[data-testid="profile-screen"]')).toBeVisible();
    await expect(page.locator('[data-testid="my-orders-table"]')).toBeVisible();
  });
});
