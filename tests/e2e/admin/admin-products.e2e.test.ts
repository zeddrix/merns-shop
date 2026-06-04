import { test, expect } from '@playwright/test';
import { loginAs, loginAsAdmin } from '../fixtures/test-helpers';
import { resetE2eDatabase } from '../fixtures/reset-db';
import { findProductById } from '../fixtures/mongo-helpers';

test.describe('admin products', () => {
  test.beforeEach(async () => {
    await resetE2eDatabase();
  });
  test('admin_create_edit_delete_product', async ({ page, request }) => {
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
    await page.locator('[data-testid="admin-product-submit"]').click();
    await page.waitForURL('**/admin/productlist');

    const createdProduct = await findProductById(productId as string);
    expect(createdProduct?.name).toBe(productName);

    await page.locator('[data-testid="search-input"]').fill(productName);
    await page.locator('[data-testid="search-submit"]').click();
    await expect(page.locator(`[data-testid="product-card-${productId}"]`)).toBeVisible();

    await page.goto(`/admin/product/${productId}/edit`);
    await page.locator('[data-testid="admin-product-name"]').fill(updatedName);
    await page.locator('[data-testid="admin-product-submit"]').click();
    await page.waitForURL('**/admin/productlist');

    await page.locator('[data-testid="search-input"]').fill(updatedName);
    await page.locator('[data-testid="search-submit"]').click();
    await expect(page.locator(`[data-testid="product-card-${productId}"]`)).toBeVisible();

    const login = await request.post('http://localhost:5000/api/users/login', {
      data: { email: 'admin@gmail.com', password: '123456' }
    });
    const { token } = (await login.json()) as { token: string };
    const deleted = await request.delete(`http://localhost:5000/api/products/${productId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    expect(deleted.ok()).toBeTruthy();

    await page.goto(`/search/${encodeURIComponent(updatedName)}`);
    await expect(page.locator(`[data-testid="product-card-${productId}"]`)).toHaveCount(0);

    const deletedProduct = await findProductById(productId as string);
    expect(deletedProduct).toBeNull();
  });

  test('non_admin_blocked_from_admin_product_routes', async ({ page }) => {
    await loginAs(page, 'customer');
    await page.goto('/admin/productlist');
    await expect(page).toHaveURL(/\/login/);
  });
});
