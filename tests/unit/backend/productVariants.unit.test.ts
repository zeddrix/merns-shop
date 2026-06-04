import { describe, expect, it } from 'vitest';
import {
  enrichProductForList,
  getProductListSummary,
  getVariantDisplayImage,
  getVariantLineName,
  resolveVariant
} from '../../../backend/utils/productVariants.js';

describe('productVariants utils', () => {
  const product = {
    image: '/images/catalog/apple/iphone-15-pro.webp',
    variants: [
      {
        sku: 'iphone-15-pro-128gb',
        label: '128GB',
        listPrice: 999,
        price: 699,
        countInStock: 5
      },
      {
        sku: 'iphone-15-pro-256gb',
        label: '256GB',
        listPrice: 1099,
        price: 769,
        countInStock: 3,
        image: '/images/catalog/apple/iphone-15-pro-256.webp'
      }
    ]
  };

  it('resolveVariant returns first when sku omitted', () => {
    const variant = resolveVariant(product, undefined);
    expect(variant?.sku).toBe('iphone-15-pro-128gb');
  });

  it('resolveVariant finds variant by sku', () => {
    const variant = resolveVariant(product, 'iphone-15-pro-256gb');
    expect(variant?.label).toBe('256GB');
  });

  it('getProductListSummary computes priceFrom and stock', () => {
    const summary = getProductListSummary(product.variants);
    expect(summary.priceFrom).toBe(699);
    expect(summary.inStock).toBe(true);
    expect(summary.totalStock).toBe(8);
    expect(summary.savingsPercentMax).toBeGreaterThan(0);
  });

  it('enrichProductForList merges summary fields', () => {
    const enriched = enrichProductForList({ name: 'iPhone 15 Pro', variants: product.variants });
    expect(enriched.priceFrom).toBe(699);
  });

  it('getVariantDisplayImage prefers variant image', () => {
    const variant = product.variants[1];
    expect(getVariantDisplayImage(product, variant)).toBe(variant.image);
  });

  it('getVariantLineName includes label', () => {
    expect(getVariantLineName('iPhone 15 Pro', product.variants[0])).toBe('iPhone 15 Pro (128GB)');
  });
});
