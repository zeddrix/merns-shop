import { test, expect } from '@playwright/test';
import { assertHomeCatalogHealthy, fillSearchAndSubmit } from '../fixtures/test-helpers';

test.describe('smoke app boot', () => {
  test('smoke_home_catalog_healthy', async ({ page, request }) => {
    await page.goto('/');
    expect(page.url()).toMatch(/localhost:5020/);
    await expect(page.locator('[data-testid="site-brand"]')).toHaveText("MERN's Shop");
    await expect(page.locator('[data-testid="home-heading"]')).toBeVisible();

    await assertHomeCatalogHealthy(page);
    await expect(page).toHaveTitle(/Welcome to MERN's Shop/);
    await expect(page.locator('meta[name="description"]').first()).toHaveAttribute(
      'content',
      /Shop phones/i
    );
    await expect(page.locator('link[rel="icon"]')).toHaveAttribute('href', /favicon\.ico/);

    const response = await request.get('/api/products');
    expect(response.ok()).toBeTruthy();
    const products = (await response.json()) as { products: unknown[] };
    expect(Array.isArray(products.products)).toBe(true);
    expect(products.products.length).toBeGreaterThan(0);

    const productImage = page.locator('[data-testid^="product-card-"] img').first();
    await expect(productImage).toHaveAttribute('src', /\/images\//);
    const loaded = await productImage.evaluate(
      (img: HTMLImageElement) => img.complete && img.naturalWidth > 0
    );
    expect(loaded).toBe(true);
  });

  test('smoke_open_product_from_home', async ({ page }) => {
    await page.goto('/');
    await assertHomeCatalogHealthy(page);

    await page.locator('[data-testid^="product-card-"]').first().locator('a').first().click();

    await expect(page.locator('[data-testid="product-details"]')).toBeVisible();
    await expect(page.locator('[data-testid="product-add-cart"]')).toBeVisible();
  });

  test('navbar_stays_visible_on_scroll', async ({ page }) => {
    await page.goto('/');
    await assertHomeCatalogHealthy(page);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect(page.locator('[data-testid="site-brand"]')).toBeInViewport();
  });

  test('desktop_search_overlay_opens_and_searches', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');
    await assertHomeCatalogHealthy(page);
    await page.locator('[data-testid="nav-search-open"]').click();
    await expect(page.locator('[data-testid="search-overlay"]')).toBeVisible();
    await fillSearchAndSubmit(page, 'iPhone');
    await expect(page.locator('[data-testid="product-list"]').first()).toBeVisible();
    await expect(page.locator('[data-testid="search-overlay"]')).toHaveCount(0);
  });

  test('global_links_not_default_blue', async ({ page }) => {
    await page.goto('/login');
    const registerLink = page.locator('[data-testid="login-register-link"]');
    await expect(registerLink).toBeVisible();
    const color = await registerLink.evaluate((el) => getComputedStyle(el).color);
    expect(color).not.toBe('rgb(0, 0, 238)');
    expect(await registerLink.evaluate((el) => getComputedStyle(el).textDecorationLine)).not.toBe(
      'underline'
    );
  });
});
