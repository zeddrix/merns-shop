import { test, expect } from '@playwright/test';
import { loginAsAdmin } from '../fixtures/test-helpers';
import { resetE2eDatabase } from '../fixtures/reset-db';
import { findProductById } from '../fixtures/mongo-helpers';

test.describe('admin product static image', () => {
  test.beforeEach(async ({ context }) => {
    await resetE2eDatabase(context);
  });

  test('admin_sets_bundled_image_path_and_storefront_loads_image', async ({ page, request }) => {
    const productName = `Static Image Product ${Date.now()}`;
    const imagePath = '/images/catalog/apple/iphone-15-pro.webp';

    await loginAsAdmin(page);
    await page.goto('/admin/productlist');
    await page.locator('[data-testid="admin-create-product"]').click();
    await page.waitForURL(/\/admin\/product\/([^/]+)\/edit/);
    const productId = page.url().match(/\/admin\/product\/([^/]+)\/edit/)?.[1];
    expect(productId).toBeTruthy();

    await page.locator('[data-testid="admin-product-name"]').fill(productName);
    await page.locator('[data-testid="admin-product-image"]').fill(imagePath);
    await page.locator('[data-testid="admin-product-brand"]').fill('Test');
    await page.locator('[data-testid="admin-product-category"]').fill('Electronics');
    await page.locator('[data-testid="admin-product-subcategory"]').fill('Phones');
    await page.locator('[data-testid="admin-variant-list-price-0"]').fill('99');
    await page.locator('[data-testid="admin-variant-price-0"]').fill('42');
    await page.locator('[data-testid="admin-variant-stock-0"]').fill('5');
    await page.locator('[data-testid="admin-product-description"]').fill('Static image E2E');
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

    const dbProduct = await findProductById(productId as string);
    expect(dbProduct?.image).toBe(imagePath);

    const imageResponse = await request.get(imagePath);
    expect(imageResponse.ok()).toBeTruthy();

    await page.goto(`/product/${productId}`);
    const productImage = page.locator('[data-testid="product-details"] img');
    await expect(productImage).toHaveAttribute('src', imagePath);
    await expect
      .poll(async () =>
        productImage.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)
      )
      .toBe(true);
  });
});
