import { test, expect } from '@playwright/test';
import { loginAsAdmin } from '../fixtures/test-helpers';

test.describe('journey admin product lifecycle', () => {
  test('admin_creates_product_visible_on_homepage', async ({ page }) => {
    const productName = `Journey Product ${Date.now()}`;
    await loginAsAdmin(page);
    await page.goto('/admin/productlist');
    await page.locator('[data-testid="admin-create-product"]').click();
    await page.waitForURL(/\/admin\/product\/.*\/edit/);
    await page.locator('[data-testid="admin-product-name"]').fill(productName);
    await page.locator('[data-testid="admin-product-price"]').fill('49');
    await page.locator('[data-testid="admin-product-image"]').fill('/images/sample.jpg');
    await page.locator('[data-testid="admin-product-submit"]').click();

    await page.goto('/');
    await page.locator('[data-testid="search-input"]').fill(productName);
    await page.locator('[data-testid="search-submit"]').click();
    await expect(page.getByText(productName)).toBeVisible();
  });
});
