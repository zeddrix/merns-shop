import { test, expect } from '@playwright/test';
import { loginAs, loginAsAdmin } from '../fixtures/test-helpers';
import { resetE2eDatabase } from '../fixtures/reset-db';
import { TEST_USERS } from '../fixtures/test-users';

test.describe('admin users', () => {
  test.beforeEach(async () => {
    await resetE2eDatabase();
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
    await expect(page.locator('tr', { hasText: 'John Updated' })).toBeVisible();
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

  test('non_admin_blocked_from_admin_user_routes', async ({ page }) => {
    await loginAs(page, 'customer');
    await page.goto('/admin/userlist');
    await expect(page).toHaveURL(/\/$/);
  });
});
