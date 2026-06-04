import { describe, expect, it } from 'vitest';
import {
  PRODUCTS_PER_PAGE,
  buildKeywordFilter,
  calculateTotalPages
} from '../../../backend/utils/productQuery.js';

describe('productQuery utilities', () => {
  it('calculates pages from count and page size', () => {
    expect(calculateTotalPages(5, PRODUCTS_PER_PAGE)).toBe(3);
    expect(calculateTotalPages(4, PRODUCTS_PER_PAGE)).toBe(2);
  });

  it('builds case-insensitive keyword filter', () => {
    const filter = buildKeywordFilter('iPhone');
    expect(filter).toEqual({
      name: { $regex: 'iPhone', $options: 'i' }
    });
  });

  it('returns empty filter when keyword is absent', () => {
    expect(buildKeywordFilter()).toEqual({});
  });
});
