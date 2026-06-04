import { test, expect } from '@playwright/test';
import { loginAs, loginAsAdmin } from '../fixtures/test-helpers';
import { resetE2eDatabase } from '../fixtures/reset-db';
import { findProductById } from '../fixtures/mongo-helpers';

test.describe('admin products', () => {
  test.beforeEach(async ({ context }) => {
    await resetE2eDatabase(context);
  });
  test('admin_create_edit_delete_product', async ({ page }) => {
    const productName = `E2E Product ${Date.now()}`;
    const updatedName = `${productName} Updated`;

    await loginAsAdmin(page);
    await page.goto('/admin/productlist');
    await page.locator('[data-testid="admin-create-product"]').click();
    await page.waitForURL(/\/admin\/product\/([^/]+)\/edit/);
    const productId = page.url().match(/\/admin\/product\/([^/]+)\/edit/)?.[1];
    expect(productId).toBeTruthy();

    await page.locator('[data-testid="admin-product-name"]').fill(productName);
    await page.locator('[data-testid="admin-product-price"]').fill('99');
    await page.locator('[data-testid="admin-product-image"]').fill('/images/sample.jpg');
    await Promise.all([
      page.waitForResponse(
        (response) =>
          response.url().includes(`/api/products/${productId}`) &&
          response.request().method() === 'PUT' &&
          response.ok()
      ),
      page.locator('[data-testid="admin-product-submit"]').click()
    ]);
    await page.waitForURL('**/admin/productlist');

    const createdProduct = await findProductById(productId as string);
    expect(createdProduct?.name).toBe(productName);

    await page.locator('[data-testid="search-input"]').fill(productName);
    await page.locator('[data-testid="search-submit"]').click();
    await expect(page.locator(`[data-testid="product-card-${productId}"]`)).toBeVisible();

    await page.goto(`/admin/product/${productId}/edit`);
    await page.locator('[data-testid="admin-product-name"]').fill(updatedName);
    await Promise.all([
      page.waitForResponse(
        (response) =>
          response.url().includes(`/api/products/${productId}`) &&
          response.request().method() === 'PUT' &&
          response.ok()
      ),
      page.locator('[data-testid="admin-product-submit"]').click()
    ]);
    await page.waitForURL('**/admin/productlist');

    await page.locator('[data-testid="search-input"]').fill(updatedName);
    await page.locator('[data-testid="search-submit"]').click();
    await expect(page.locator(`[data-testid="product-card-${productId}"]`)).toBeVisible();

    await page.request.post('/api/users/login', {
      data: { email: 'admin@gmail.com', password: '123456' }
    });
    const deleted = await page.request.delete(`/api/products/${productId}`);
    expect(deleted.ok()).toBeTruthy();

    await page.goto(`/search/${encodeURIComponent(updatedName)}`);
    await expect(page.locator(`[data-testid="product-card-${productId}"]`)).toHaveCount(0);

    const deletedProduct = await findProductById(productId as string);
    expect(deletedProduct).toBeNull();
  });

  test('product_edit_validation_shows_errors', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/productlist');
    await page.locator('[data-testid="admin-create-product"]').click();
    await page.waitForURL(/\/admin\/product\/([^/]+)\/edit/);
    await page.locator('[data-testid="admin-product-name"]').fill('');
    await page.locator('[data-testid="admin-product-price"]').fill('-1');
    await page.locator('[data-testid="admin-product-submit"]').click();
    await expect(page.locator('[data-testid="admin-product-edit-form"]')).toBeVisible();
    await expect(page).toHaveURL(/\/admin\/product\/.*\/edit/);
  });

  test('non_admin_blocked_from_admin_product_routes', async ({ page }) => {
    await loginAs(page, 'customer');
    await page.goto('/admin/productlist');
    await expect(page).toHaveURL(/\/$/);
  });
});
