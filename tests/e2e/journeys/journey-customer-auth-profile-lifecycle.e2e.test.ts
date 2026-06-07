import { test, expect } from '@playwright/test';
import {
  logout,
  loginWithCredentials,
  createPaidOrderForCredentials,
  openAuthModal
} from '../fixtures/test-helpers';
import { resetE2eDatabase } from '../fixtures/reset-db';
import { findUserByEmail } from '../fixtures/mongo-helpers';

test.describe('journey customer auth profile lifecycle', () => {
  test.beforeEach(async ({ context }) => {
    await resetE2eDatabase(context);
  });

  test('customer_registers_logs_in_updates_profile_and_sees_orders', async ({ page }) => {
    const unique = Date.now();
    const email = `journey-user-${unique}@example.com`;
    const password = 'TestPass1!';

    await page.goto('/?auth=register');
    await expect(page.locator('[data-testid="auth-modal"]')).toBeVisible();
    await page.locator('[data-testid="register-name"]').fill('Journey Customer');
    await page.locator('[data-testid="register-email"]').fill(email);
    await page.locator('[data-testid="register-password"]').fill(password);
    await page.locator('[data-testid="register-confirm-password"]').fill(password);
    await Promise.all([
      page.waitForResponse(
        (response) => response.url().includes('/api/users') && response.status() === 201
      ),
      page.locator('[data-testid="register-submit"]').click()
    ]);

    const orderId = await createPaidOrderForCredentials(page, email, password);

    await logout(page);
    await openAuthModal(page, 'login');
    await loginWithCredentials(page, email, password);

    await page.goto('/profile');
    await page.locator('[data-testid="profile-name"]').fill('Journey Customer Updated');
    await Promise.all([
      page.waitForResponse(
        (response) => response.url().includes('/api/users/profile') && response.status() === 200
      ),
      page.locator('[data-testid="profile-submit"]').click()
    ]);
    await expect(page.getByText('Profile Updated')).toBeVisible();
    await expect(page.locator('[data-testid="my-orders-table"]')).toBeVisible();
    await expect(page.locator(`[data-testid="my-order-${orderId}"]`)).toBeVisible();

    const dbUser = await findUserByEmail(email);
    expect(dbUser?.name).toBe('Journey Customer Updated');
  });
});
