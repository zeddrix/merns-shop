import { test, expect } from '@playwright/test';
import {
  searchProducts,
  productCardByExactName,
  clickProductCardToPdp
} from '../fixtures/test-helpers';

test.describe('catalog product image integrity', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-testid="product-list"]')).toBeVisible();
  });

  test('known_bad_products_show_phone_media', async ({ page }) => {
    const products = ['vivo T2', 'POCO X4 Pro', 'Redmi 9C'];

    for (const name of products) {
      await searchProducts(page, name);
      const card = productCardByExactName(page, name);
      await expect(card).toBeVisible();
      const media = card.locator('[data-testid="catalog-card-media"] img');
      await expect(media).toBeVisible();
      const src = await media.getAttribute('src');
      const srcset = await media.getAttribute('srcset');
      expect(src).toMatch(/\/images\/catalog\/.*\.webp$/);
      expect(srcset).toBeTruthy();
      expect(srcset).toContain('400w');
      const naturalWidth = await media.evaluate((img: HTMLImageElement) => img.naturalWidth);
      expect(naturalWidth).toBeGreaterThan(0);
    }
  });

  test('catalog_card_srcset_variants_exist', async ({ page, request }) => {
    await searchProducts(page, 'Galaxy M32');
    const card = productCardByExactName(page, 'Galaxy M32');
    await expect(card).toBeVisible();
    const srcset = await card
      .locator('[data-testid="catalog-card-media"] img')
      .getAttribute('srcset');
    expect(srcset).toBeTruthy();
    const firstVariant = srcset?.split(',')[0]?.trim().split(' ')[0];
    expect(firstVariant).toBeTruthy();
    const imageRes = await request.get(firstVariant as string);
    expect(imageRes.ok()).toBeTruthy();

    await clickProductCardToPdp(card);
    await expect(page.locator('[data-testid="product-details"]')).toBeVisible();
  });

  test('samsung_m_series_distinct_src', async ({ page }) => {
    await searchProducts(page, 'Galaxy M32');
    const m32Card = productCardByExactName(page, 'Galaxy M32');
    await expect(m32Card).toBeVisible();
    const m32Src = await m32Card
      .locator('[data-testid="catalog-card-media"] img')
      .getAttribute('src');

    await searchProducts(page, 'Galaxy M54');
    const m54Card = productCardByExactName(page, 'Galaxy M54');
    await expect(m54Card).toBeVisible();
    const m54Src = await m54Card
      .locator('[data-testid="catalog-card-media"] img')
      .getAttribute('src');

    expect(m32Src).toBeTruthy();
    expect(m54Src).toBeTruthy();
    expect(m32Src).not.toEqual(m54Src);
  });

  test('catalog_audit_script_passes', async () => {
    const { execSync } = await import('node:child_process');
    const output = execSync('node scripts/audit-catalog-image-relevance.mjs', {
      cwd: process.cwd(),
      encoding: 'utf8'
    });
    expect(output).toContain('0 failed');
  });
});
