import { test, expect } from '@playwright/test';
import { loginAs, loginAsAdmin, logout } from '../fixtures/test-helpers';
import { resetE2eDatabase } from '../fixtures/reset-db';
import { findUserByEmail } from '../fixtures/mongo-helpers';
import { TEST_USERS } from '../fixtures/test-users';

test.describe('journey admin user privilege', () => {
  test.beforeEach(async ({ context }) => {
    await resetE2eDatabase(context);
  });

  test('admin_promotes_jane_then_jane_accesses_admin_userlist', async ({ page }) => {
    const jane = await findUserByEmail(TEST_USERS.jane.email);
    expect(jane?._id).toBeTruthy();
    const janeId = String(jane?._id);

    await loginAsAdmin(page);
    await page.goto('/admin/userlist');
    await expect(page.locator('[data-testid="admin-user-list"]')).toBeVisible();
    await page.locator(`[data-testid="admin-user-edit-${janeId}"]`).click();
    await page.locator('[data-testid="admin-user-is-admin"]').check();
    await Promise.all([
      page.waitForResponse(
        (response) =>
          response.url().includes(`/api/users/${janeId}`) &&
          response.request().method() === 'PUT' &&
          response.status() === 200
      ),
      page.locator('[data-testid="admin-user-submit"]').click()
    ]);
    await page.waitForURL('**/admin/userlist');

    const promotedJane = await findUserByEmail(TEST_USERS.jane.email);
    expect(promotedJane?.isAdmin).toBe(true);

    await logout(page);
    await loginAs(page, 'jane');
    await page.goto('/admin/userlist');
    await expect(page.locator('[data-testid="admin-user-list"]')).toBeVisible();
    await expect(page.locator('tr', { hasText: TEST_USERS.customer.email })).toBeVisible();
  });
});
