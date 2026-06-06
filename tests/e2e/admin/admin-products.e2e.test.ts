import { test, expect } from '@playwright/test';
import {
  clickProductCardToPdp,
  fillSearchAndSubmit,
  loginAs,
  loginAsAdmin
} from '../fixtures/test-helpers';
import { MOBILE_VIEWPORT } from '../fixtures/viewports';
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
    await page.locator('[data-testid="admin-product-model-key"]').fill(`e2e-${Date.now()}`);
    await page.locator('[data-testid="admin-product-subcategory"]').fill('Phones');
    await page.locator('[data-testid="admin-product-description"]').fill('E2E catalog product');
    await page.locator('[data-testid="admin-product-image"]').fill('/images/sample.jpg');
    await page.locator('[data-testid="admin-variant-label-0"]').fill('128GB');
    await page.locator('[data-testid="admin-variant-list-price-0"]').fill('199');
    await page.locator('[data-testid="admin-variant-price-0"]').fill('149');
    await page.locator('[data-testid="admin-variant-stock-0"]').fill('3');
    await page.locator('button:has-text("Add variant")').click();
    await page.locator('[data-testid="admin-variant-sku-1"]').fill(`e2e-${Date.now()}-256gb`);
    await page.locator('[data-testid="admin-variant-label-1"]').fill('256GB');
    await page.locator('[data-testid="admin-variant-list-price-1"]').fill('249');
    await page.locator('[data-testid="admin-variant-price-1"]').fill('199');
    await page.locator('[data-testid="admin-variant-stock-1"]').fill('2');
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
    expect(createdProduct?.variants.length).toBeGreaterThanOrEqual(1);

    await fillSearchAndSubmit(page, productName);
    await expect(page.locator(`[data-testid="product-card-${productId}"]`)).toBeVisible();
    await clickProductCardToPdp(page.locator(`[data-testid="product-card-${productId}"]`));
    await expect(page.locator('[data-testid="product-variant-picker"]')).toBeVisible();
    await expect(page.locator('input[data-testid^="product-variant-"]')).toHaveCount(2);
    await page.locator('[data-testid="product-go-back"]').click();

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

    await fillSearchAndSubmit(page, updatedName);
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
    await page.locator('[data-testid="admin-product-submit"]').click();
    await expect(page.locator('[data-testid="admin-product-edit-form"]')).toBeVisible();
    await expect(page).toHaveURL(/\/admin\/product\/.*\/edit/);
  });

  test('non_admin_blocked_from_admin_product_routes', async ({ page }) => {
    const productsResponse = await page.request.get('/api/products');
    expect(productsResponse.ok()).toBeTruthy();
    const productsBody = (await productsResponse.json()) as {
      products: Array<{ _id: string }>;
    };
    const productId = productsBody.products[0]?._id;
    expect(productId).toBeTruthy();

    await loginAs(page, 'customer');
    await page.goto('/admin/productlist');
    await expect(page).toHaveURL(/\/$/);
    await page.goto(`/admin/product/${productId}/edit`);
    await expect(page).toHaveURL(/\/$/);
  });

  test('admin_pagination_scrolls_to_list_heading', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await loginAsAdmin(page);
    await page.goto('/admin/productlist');
    await expect(page.locator('[data-testid="admin-product-list"]')).toBeVisible();
    await expect(page.locator('[data-testid="pagination"]')).toBeVisible();

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.locator('[data-testid="pagination-next"]').click();
    await expect(page).toHaveURL(/\/admin\/productlist\/2/);

    await expect
      .poll(async () =>
        page.locator('[data-testid="admin-product-list-heading"]').evaluate((el) => {
          const rect = el.getBoundingClientRect();
          return rect.top >= 0 && rect.top < window.innerHeight;
        })
      )
      .toBe(true);
  });

  test('admin_product_list_scrollable_table', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await loginAsAdmin(page);
    await page.goto('/admin/productlist');
    await expect(page.locator('[data-testid="admin-product-list"]')).toBeVisible();

    await page.locator('[data-testid^="admin-product-edit-"]').first().click();
    await expect(page.locator('[data-testid="admin-product-edit"]')).toBeVisible();

    const scrollable = await page
      .locator('[data-testid="admin-product-variants"]')
      .evaluate((table: HTMLTableElement) => {
        const wrapper = table.closest('.table-responsive');
        const target = wrapper ?? table;
        return target.scrollWidth > target.clientWidth;
      });
    expect(scrollable).toBe(true);
  });
});
