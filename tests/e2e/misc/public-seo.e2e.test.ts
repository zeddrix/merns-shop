import { test, expect } from '@playwright/test';
import { assertHomeCatalogHealthy, loginAsAdmin } from '../fixtures/test-helpers';

const IPHONE_15_PRO = 'iPhone 15 Pro';

test.describe('public seo', () => {
  test('robots_txt_disallows_private', async ({ request }) => {
    const response = await request.get('/robots.txt');
    expect(response.ok()).toBeTruthy();
    const body = await response.text();
    expect(body).toContain('Disallow: /admin');
    expect(body).toContain('Disallow: /login');
    expect(body).toMatch(/Sitemap: https?:\/\//);
  });

  test('sitemap_lists_seeded_product', async ({ request }) => {
    const productsRes = await request.get('/api/products?keyword=iPhone%2015%20Pro');
    expect(productsRes.ok()).toBeTruthy();
    const { products } = (await productsRes.json()) as { products: Array<{ _id: string }> };
    const iphone = products.find((p) => p._id);
    expect(iphone).toBeTruthy();

    const sitemapRes = await request.get('/sitemap.xml');
    expect(sitemapRes.ok()).toBeTruthy();
    const xml = await sitemapRes.text();
    expect(xml).toContain(`/product/${iphone?._id}</loc>`);
  });

  test('login_noindex', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('[data-testid="login-heading"]')).toBeVisible();
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      'content',
      'noindex,nofollow'
    );
  });

  test('search_results_meta', async ({ page }) => {
    await page.goto('/');
    await assertHomeCatalogHealthy(page);
    await page.locator('[data-testid="search-input"]').fill(IPHONE_15_PRO);
    await page.locator('[data-testid="search-submit"]').click();
    await expect(page.locator('[data-testid="product-list"]')).toBeVisible();
    await expect(page).toHaveTitle(/iPhone 15 Pro/);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex,follow');
  });

  test('filter_query_canonical_root', async ({ page }) => {
    await page.goto('/?brand=Apple');
    await assertHomeCatalogHealthy(page);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/$/);
  });

  test('admin_noindex', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/productlist');
    await expect(page.locator('[data-testid="admin-product-list"]')).toBeVisible();
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      'content',
      'noindex,nofollow'
    );
  });
});
