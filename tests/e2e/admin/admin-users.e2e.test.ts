import { test, expect } from '@playwright/test';
import {
  fetchSeededUserId,
  loginAs,
  loginAsAdmin,
  logout,
  openAdminNavDropdown
} from '../fixtures/test-helpers';
import { resetE2eDatabase } from '../fixtures/reset-db';
import { findUserByEmail } from '../fixtures/mongo-helpers';
import { TEST_USERS } from '../fixtures/test-users';

test.describe('admin users', () => {
  test.beforeEach(async ({ context }) => {
    await resetE2eDatabase(context);
  });

  test('admin_lists_and_edits_user', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/userlist');
    await page.locator('[data-testid="admin-user-list"]').waitFor({ state: 'visible' });

    await page
      .locator('tr', { hasText: TEST_USERS.customer.email })
      .locator('[data-testid^="admin-user-edit-"]')
      .click();
    await page.locator('[data-testid="admin-user-name"]').fill('John Updated');
    await Promise.all([
      page.waitForResponse(
        (response) =>
          response.url().includes('/api/users/') &&
          response.request().method() === 'PUT' &&
          response.status() === 200
      ),
      page.locator('[data-testid="admin-user-submit"]').click()
    ]);
    await page.waitForURL('**/admin/userlist');
    const johnRow = page.locator('tr', { hasText: TEST_USERS.customer.email });
    await expect(johnRow.locator('[data-testid^="admin-user-name-"]')).toHaveText('John Updated');
  });

  test('admin_promotes_user_to_admin', async ({ page }) => {
    const janeId = await fetchSeededUserId(page, TEST_USERS.jane.email);

    await loginAsAdmin(page);
    await page.goto('/admin/userlist');
    await page.locator('[data-testid="admin-user-list"]').waitFor({ state: 'visible' });
    await page.locator(`[data-testid="admin-user-edit-${janeId}"]`).click();
    await expect(page.locator('[data-testid="admin-user-is-admin"]')).not.toBeChecked();
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
    await openAdminNavDropdown(page);
    await expect(page.locator('[data-testid="nav-admin-products"]')).toBeVisible();
  });

  test('admin_deletes_user', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/userlist');
    await page.locator('[data-testid="admin-user-list"]').waitFor({ state: 'visible' });

    const janeRow = page.locator('tr', { hasText: TEST_USERS.jane.email });
    await expect(janeRow).toBeVisible();

    page.once('dialog', (dialog) => dialog.accept());
    await janeRow.locator('[data-testid^="admin-user-delete-"]').click();

    await expect(page.locator('tr', { hasText: TEST_USERS.jane.email })).toHaveCount(0);
  });

  test('admin_cannot_delete_self', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/userlist');
    const adminRow = page.locator('tr', { hasText: TEST_USERS.admin.email });
    page.once('dialog', (dialog) => dialog.accept());
    await adminRow.locator('[data-testid^="admin-user-delete-"]').click();
    await expect(page.getByText('Admin cannot delete their own account')).toBeVisible();
    await expect(adminRow).toBeVisible();
  });

  test('non_admin_blocked_from_admin_user_routes', async ({ page }) => {
    const userId = await fetchSeededUserId(page, TEST_USERS.customer.email);

    await loginAs(page, 'customer');
    await page.goto('/admin/userlist');
    await expect(page).toHaveURL(/\/$/);
    await page.goto(`/admin/user/${userId}/edit`);
    await expect(page).toHaveURL(/\/$/);
  });
});
