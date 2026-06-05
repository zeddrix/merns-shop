import { test, expect } from '@playwright/test';
import { fillSearchAndSubmit, loginAsAdmin } from '../fixtures/test-helpers';

test.describe('journey admin product lifecycle', () => {
  test('admin_creates_product_visible_on_homepage', async ({ page }) => {
    const productName = `Journey Product ${Date.now()}`;
    await loginAsAdmin(page);
    await page.goto('/admin/productlist');
    await page.locator('[data-testid="admin-create-product"]').click();
    await page.waitForURL(/\/admin\/product\/.*\/edit/);
    await page.locator('[data-testid="admin-product-name"]').fill(productName);
    await page.locator('[data-testid="admin-product-model-key"]').fill(`journey-${Date.now()}`);
    await page.locator('[data-testid="admin-product-subcategory"]').fill('Phones');
    await page
      .locator('[data-testid="admin-product-description"]')
      .fill('Journey lifecycle product');
    await page.locator('[data-testid="admin-product-image"]').fill('/images/sample.jpg');
    await page.locator('[data-testid="admin-variant-label-0"]').fill('128GB');
    await page.locator('[data-testid="admin-variant-list-price-0"]').fill('199');
    await page.locator('[data-testid="admin-variant-price-0"]').fill('149');
    await page.locator('[data-testid="admin-variant-stock-0"]').fill('3');
    await page.locator('[data-testid="admin-product-submit"]').click();
    await page.waitForURL('**/admin/productlist');

    await page.goto('/');
    await fillSearchAndSubmit(page, productName);
    await expect(page.getByText(productName)).toBeVisible();
    await page.getByText(productName).click();
    await expect(page.locator('[data-testid="product-variant-picker"]')).toBeVisible();
  });
});
