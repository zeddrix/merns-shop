import { describe, expect, it } from 'vitest';
import {
  buildCanonicalUrl,
  buildHomeCanonicalPath,
  buildProductJsonLd,
  buildProductTitle,
  buildSearchTitle,
  truncateDescription
} from '../../../frontend/src/utils/seoMeta';
import type { Product } from '../../../frontend/src/types';

const sampleProduct: Product = {
  _id: 'prod1',
  name: 'iPhone 15 Pro',
  image: '/images/catalog/iphone-15-pro.webp',
  brand: 'Apple',
  category: 'Phones',
  subcategory: 'Smartphones',
  modelKey: 'iphone-15-pro',
  releaseYear: 2023,
  condition: 'New',
  description: 'A'.repeat(200),
  reviews: [],
  rating: 4.5,
  numReviews: 2,
  variants: [
    {
      sku: 'iphone-15-pro-128gb',
      label: '128GB',
      listPrice: 999,
      price: 899,
      countInStock: 5
    }
  ],
  user: 'user1',
  priceFrom: 899,
  inStock: true
};

describe('seoMeta utilities', () => {
  it('truncateDescription caps length with ellipsis', () => {
    const result = truncateDescription('A'.repeat(200), 155);
    expect(result.length).toBeLessThanOrEqual(155);
    expect(result.endsWith('…')).toBe(true);
  });

  it('buildSearchTitle includes keyword and brand', () => {
    expect(buildSearchTitle('iPhone')).toContain('iPhone');
    expect(buildSearchTitle('iPhone')).toContain("MERN's Shop");
  });

  it('buildProductTitle includes product name', () => {
    expect(buildProductTitle('iPhone 15 Pro')).toContain('iPhone 15 Pro');
  });

  it('buildHomeCanonicalPath strips filter query to root', () => {
    expect(buildHomeCanonicalPath({ hasFilterQuery: true })).toBe('/');
  });

  it('buildHomeCanonicalPath preserves search path', () => {
    expect(
      buildHomeCanonicalPath({ keyword: 'phone', pageNumber: '2', hasFilterQuery: false })
    ).toBe('/search/phone/page/2');
  });

  it('buildCanonicalUrl produces absolute URL', () => {
    expect(buildCanonicalUrl('/product/abc')).toMatch(/\/product\/abc$/);
  });

  it('buildProductJsonLd includes Product type and offers', () => {
    const jsonLd = buildProductJsonLd(sampleProduct);
    expect(jsonLd['@type']).toBe('Product');
    expect(jsonLd.name).toBe('iPhone 15 Pro');
    const offers = jsonLd.offers as Record<string, unknown>;
    expect(offers['@type']).toBe('Offer');
    expect(offers.priceCurrency).toBe('USD');
  });
});
