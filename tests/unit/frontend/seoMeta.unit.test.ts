import { describe, expect, it } from 'vitest';
import {
  buildAboutMetaDescription,
  buildCanonicalUrl,
  buildDeveloperSameAs,
  buildHomeCanonicalPath,
  buildMetaDescription,
  buildPersonJsonLd,
  buildProductJsonLd,
  buildProductMetaDescription,
  buildProductTitle,
  buildSearchMetaDescription,
  buildSearchTitle,
  DEFAULT_META_DESCRIPTION,
  defaultOgImageUrl,
  truncateDescription
} from '../../../frontend/src/utils/seoMeta';
import { DEVELOPER_LINKEDIN_URL, DEVELOPER_NAME } from '../../../frontend/src/constants/seo';
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

  it('buildMetaDescription appends developer attribution suffix', () => {
    const result = buildMetaDescription('Shop electronics at great prices.');
    expect(result).toContain('Developed by Zeddrix Fabian');
    expect(result.length).toBeLessThanOrEqual(155);
  });

  it('buildMetaDescription skips duplicate attribution when name already present', () => {
    const about = buildAboutMetaDescription();
    expect(about).toContain(DEVELOPER_NAME);
    expect(about.match(/Developed by Zeddrix Fabian/g)?.length ?? 0).toBeLessThanOrEqual(1);
  });

  it('buildSearchMetaDescription includes keyword and developer', () => {
    const result = buildSearchMetaDescription('iPhone');
    expect(result).toContain('iPhone');
    expect(result).toContain('Zeddrix Fabian');
  });

  it('buildProductMetaDescription preserves product copy and developer', () => {
    const result = buildProductMetaDescription('Titanium design and A17 Pro chip.');
    expect(result).toContain('Titanium');
    expect(result).toContain('Zeddrix Fabian');
    expect(result.length).toBeLessThanOrEqual(155);
  });

  it('DEFAULT_META_DESCRIPTION includes developer attribution', () => {
    expect(DEFAULT_META_DESCRIPTION).toContain('Zeddrix Fabian');
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

  it('buildPersonJsonLd includes sameAs profiles', () => {
    const jsonLd = buildPersonJsonLd();
    expect(jsonLd['@type']).toBe('Person');
    expect(jsonLd.name).toBe(DEVELOPER_NAME);
    const sameAs = jsonLd.sameAs as string[];
    expect(sameAs).toContain('https://github.com/zeddrix/merns-shop');
    expect(sameAs).toContain('https://github.com/zeddrix/portfolio');
    expect(sameAs).toContain(DEVELOPER_LINKEDIN_URL);
  });

  it('buildDeveloperSameAs returns three profile URLs', () => {
    expect(buildDeveloperSameAs()).toHaveLength(3);
  });

  it('defaultOgImageUrl points to branded share image', () => {
    expect(defaultOgImageUrl()).toMatch(/\/images\/og-default\.webp$/);
  });
});
