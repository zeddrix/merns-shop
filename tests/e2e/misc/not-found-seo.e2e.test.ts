import { test, expect } from '@playwright/test';

test.describe('not found seo', () => {
  test('unknown_route_sets_noindex_meta_with_developer', async ({ page }) => {
    await page.goto('/does-not-exist');
    await expect(page.locator('[data-testid="not-found-page"]')).toBeVisible();
    await expect(page).toHaveTitle(/Not Found/);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      'content',
      'noindex,nofollow'
    );
    await expect(page.locator('meta[name="description"]').first()).toHaveAttribute(
      'content',
      /Zeddrix Fabian/
    );
    await page.locator('[data-testid="not-found-home-link"]').click();
    await expect(page.locator('[data-testid="home-heading"]')).toBeVisible();
  });
});
