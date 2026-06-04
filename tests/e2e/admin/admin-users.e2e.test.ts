import { test, expect } from '@playwright/test';
import { loginAsAdmin } from '../fixtures/test-helpers';
import { resetE2eDatabase } from '../fixtures/reset-db';

test.describe('admin users', () => {
  test.beforeEach(async () => {
    await resetE2eDatabase();
  });
  test('admin_edit_user', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/userlist');
    await page.locator('[data-testid="admin-user-list"]').waitFor({ state: 'visible' });

    await page
      .locator('tr', { hasText: 'john@gmail.com' })
      .locator('[data-testid^="admin-user-edit-"]')
      .click();
    await page.locator('[data-testid="admin-user-name"]').fill('John Updated');
    await page.locator('[data-testid="admin-user-submit"]').click();
    await page.waitForURL('**/admin/userlist');
    await expect(page.getByText('John Updated')).toBeVisible();
  });
});
