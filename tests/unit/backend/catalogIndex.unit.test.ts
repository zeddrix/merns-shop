import { describe, expect, it } from 'vitest';
import buildSeedProducts, { getCatalogStats } from '../../../backend/data/catalog/index.js';

describe('catalog index', () => {
  it('meets minimum parent and variant counts', () => {
    const stats = getCatalogStats();
    expect(stats.parentCount).toBeGreaterThanOrEqual(140);
    expect(stats.variantCount).toBeGreaterThanOrEqual(500);
  });

  it('has unique modelKey and variant skus', () => {
    const products = buildSeedProducts();
    const modelKeys = new Set<string>();
    const skus = new Set<string>();

    for (const product of products) {
      expect(modelKeys.has(product.modelKey)).toBe(false);
      modelKeys.add(product.modelKey);

      for (const variant of product.variants) {
        expect(skus.has(variant.sku)).toBe(false);
        skus.add(variant.sku);
        expect(variant.price).toBeLessThan(variant.listPrice);
      }
    }
  });

  it('gives iPhone 15 Pro 256GB extra stock for qty-cap E2E', () => {
    const pro = buildSeedProducts().find((p) => p.modelKey === 'iphone-15-pro');
    const v256 = pro?.variants.find((v) => v.sku === 'iphone-15-pro-256gb');
    expect(v256?.countInStock).toBe(50);
  });

  it('includes Echo Dot out-of-stock fixture', () => {
    const echo = buildSeedProducts().find((p) => p.name.includes('Echo Dot'));
    expect(echo).toBeDefined();
    expect(echo?.variants.every((v) => v.countInStock === 0)).toBe(true);
  });
});
