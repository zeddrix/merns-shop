import { test, expect } from '@playwright/test';
import {
  assertHomeCatalogHealthy,
  fillSearchAndSubmit,
  loginAsAdmin
} from '../fixtures/test-helpers';

const IPHONE_15_PRO = 'iPhone 15 Pro';

test.describe('public seo', () => {
  test('robots_txt_disallows_private', async ({ request }) => {
    const response = await request.get('/robots.txt');
    expect(response.ok()).toBeTruthy();
    const body = await response.text();
    expect(body).toContain('Disallow: /admin');
    expect(body).not.toContain('Disallow: /login');
    expect(body).not.toContain('Disallow: /register');
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

  test('auth_modal_does_not_force_home_noindex', async ({ page }) => {
    await page.goto('/?auth=login');
    await expect(page.locator('[data-testid="auth-modal"]')).toBeVisible();
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'index,follow');
  });

  test('search_results_meta', async ({ page }) => {
    await page.goto('/');
    await assertHomeCatalogHealthy(page);
    await fillSearchAndSubmit(page, IPHONE_15_PRO);
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
