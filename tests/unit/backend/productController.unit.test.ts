import { describe, expect, it } from 'vitest';
import {
  PRODUCTS_PER_PAGE,
  buildProductListFilter,
  calculateTotalPages
} from '../../../backend/utils/productQuery.js';

describe('productQuery utilities', () => {
  it('calculates pages from count and page size', () => {
    expect(calculateTotalPages(25, PRODUCTS_PER_PAGE)).toBe(3);
    expect(calculateTotalPages(12, PRODUCTS_PER_PAGE)).toBe(1);
  });

  it('builds keyword filter across name and variants', () => {
    const filter = buildProductListFilter({ keyword: 'iPhone' });
    expect(filter.$or).toBeDefined();
  });

  it('builds brand and category filters', () => {
    const filter = buildProductListFilter({ brand: 'Apple', category: 'Electronics' });
    expect(filter.brand).toBe('Apple');
    expect(filter.category).toBe('Electronics');
  });

  it('returns empty filter when no params', () => {
    expect(buildProductListFilter({})).toEqual({});
  });
});
