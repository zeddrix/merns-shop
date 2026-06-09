import { test, expect } from '@playwright/test';
import { E2E_CLIENT_PORT } from '../config/e2e-ports';
import {
  assertHomeCatalogHealthy,
  clickProductCardToPdp,
  fillSearchAndSubmit
} from '../fixtures/test-helpers';

test.describe('smoke app boot', () => {
  test('smoke_home_catalog_healthy', async ({ page, request }) => {
    await page.goto('/');
    await page.locator('[data-testid="pagination-next"]').click();
    await expect(page).toHaveURL(/\/page\/2/);
    await page.locator('[data-testid="pagination-prev"]').click();
    expect(page.url()).toMatch(new RegExp(`localhost:${E2E_CLIENT_PORT}`));
    await expect(page.locator('[data-testid="site-brand"]')).toHaveText("MERN's Shop");
    await expect(page.locator('[data-testid="home-heading"]')).toBeVisible();

    await assertHomeCatalogHealthy(page);
    await expect(page).toHaveTitle(/Welcome to MERN's Shop/);
    await expect(page.locator('meta[name="description"]').first()).toHaveAttribute(
      'content',
      /Zeddrix Fabian/
    );
    await expect(page.locator('meta[name="author"]')).toHaveAttribute('content', 'Zeddrix Fabian');
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
      'content',
      /\/images\/og-default\.webp/
    );
    await expect(page.locator('[data-testid="footer-developer-link"]')).toBeVisible();
    await expect(page.locator('[data-testid="footer-developer-link"]')).toHaveAttribute(
      'href',
      '/about'
    );
    const currentYear = new Date().getFullYear();
    await expect(page.locator('[data-testid="site-footer"]')).toContainText(
      `Copyright Zeddrix Fabian © ${currentYear} MERN's Shop`
    );
    await expect(page.locator('[data-testid="footer-about-link"]')).toHaveCount(0);
    const jsonLdScripts = page.locator('script[type="application/ld+json"]');
    const jsonLdTexts = await jsonLdScripts.allTextContents();
    const hasPerson = jsonLdTexts.some((raw) => {
      const parsed = JSON.parse(raw) as { '@type'?: string; name?: string };
      return parsed['@type'] === 'Person' && parsed.name === 'Zeddrix Fabian';
    });
    expect(hasPerson).toBe(true);
    await expect(page.locator('link[rel="icon"]')).toHaveAttribute('href', /favicon\.ico/);

    const response = await request.get('/api/products');
    expect(response.ok()).toBeTruthy();
    const products = (await response.json()) as { products: unknown[] };
    expect(Array.isArray(products.products)).toBe(true);
    expect(products.products.length).toBeGreaterThan(0);

    const carouselMedia = page.locator('[data-testid="product-carousel-media"]').first();
    await expect(carouselMedia).toBeVisible();
    const carouselBox = await carouselMedia.boundingBox();
    expect(carouselBox?.height ?? 0).toBeGreaterThan(200);
    expect(carouselBox?.height ?? 0).toBeLessThanOrEqual(400);
    const carouselObjectFit = await carouselMedia.evaluate(
      (el) => getComputedStyle(el.querySelector('img') ?? el).objectFit
    );
    expect(carouselObjectFit).toBe('contain');

    const productImage = page.locator('[data-testid="catalog-card-media"] img').first();
    await expect(productImage).toHaveAttribute('src', /\/images\//);
    const loaded = await productImage.evaluate(
      (img: HTMLImageElement) => img.complete && img.naturalWidth > 0
    );
    expect(loaded).toBe(true);
  });

  test('smoke_open_product_from_home', async ({ page }) => {
    await page.goto('/');
    await assertHomeCatalogHealthy(page);

    await clickProductCardToPdp(page.locator('[data-testid^="product-card-"]').first());

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
    await expect(page.locator('.search-overlay-panel--dark')).toBeVisible();
    await fillSearchAndSubmit(page, 'iPhone');
    await expect(page.locator('[data-testid="product-list"]').first()).toBeVisible();
    await expect(page.locator('[data-testid="search-overlay"]')).toHaveCount(0);
  });

  test('auth_modal_register_link_not_default_blue', async ({ page }) => {
    await page.goto('/?auth=login');
    await expect(page.locator('[data-testid="auth-modal"]')).toBeVisible();
    const registerLink = page.locator('[data-testid="login-register-link"]');
    await expect(registerLink).toBeVisible();
    const color = await registerLink.evaluate((el) => getComputedStyle(el).color);
    expect(color).not.toBe('rgb(0, 0, 238)');
    expect(await registerLink.evaluate((el) => getComputedStyle(el).textDecorationLine)).not.toBe(
      'underline'
    );
  });

  test('unknown_route_shows_not_found_without_crash', async ({ page }) => {
    await page.goto('/this-route-does-not-exist');
    await expect(page.locator('[data-testid="site-brand"]')).toBeVisible();
    await expect(page.locator('[data-testid="not-found-page"]')).toBeVisible();
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      'content',
      'noindex,nofollow'
    );
  });
});
