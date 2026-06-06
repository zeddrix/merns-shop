import { describe, expect, it } from 'vitest';
import {
  PRODUCTS_PER_PAGE,
  buildProductListFilter,
  buildProductSort,
  calculateTotalPages,
  getPriceSortDirection,
  isPriceSort
} from '../../../backend/utils/productQuery.js';

describe('productQuery utilities', () => {
  it('calculates pages from count and page size', () => {
    expect(calculateTotalPages(25, PRODUCTS_PER_PAGE)).toBe(3);
    expect(calculateTotalPages(12, PRODUCTS_PER_PAGE)).toBe(1);
    expect(calculateTotalPages(0, PRODUCTS_PER_PAGE)).toBe(1);
  });

  it('builds keyword filter across name and variants', () => {
    const filter = buildProductListFilter({ keyword: 'iPhone' });
    expect(filter.$or).toBeDefined();
  });

  it('builds brand, category, and subcategory filters', () => {
    const filter = buildProductListFilter({
      brand: 'Apple',
      category: 'Electronics',
      subcategory: 'Phones'
    });
    expect(filter.brand).toBe('Apple');
    expect(filter.category).toBe('Electronics');
    expect(filter.subcategory).toBe('Phones');
  });

  it('builds min and max price filters', () => {
    const filter = buildProductListFilter({ minPrice: 100, maxPrice: 500 });
    expect(filter['variants.price']).toEqual({ $gte: 100, $lte: 500 });
  });

  it('returns empty filter when no params', () => {
    expect(buildProductListFilter({})).toEqual({});
  });
});

describe('buildProductSort', () => {
  it('sorts by variant price ascending', () => {
    expect(buildProductSort('price-asc')).toEqual({ 'variants.price': 1 });
  });

  it('sorts by variant price descending', () => {
    expect(buildProductSort('price-desc')).toEqual({ 'variants.price': -1 });
  });

  it('sorts by rating descending', () => {
    expect(buildProductSort('rating')).toEqual({ rating: -1 });
  });

  it('sorts by release year and createdAt for newest', () => {
    expect(buildProductSort('newest')).toEqual({ releaseYear: -1, createdAt: -1 });
  });

  it('defaults to createdAt descending', () => {
    expect(buildProductSort()).toEqual({ createdAt: -1 });
    expect(buildProductSort('unknown')).toEqual({ createdAt: -1 });
  });

  it('detects price sort keys', () => {
    expect(isPriceSort('price-asc')).toBe(true);
    expect(isPriceSort('price-desc')).toBe(true);
    expect(isPriceSort('rating')).toBe(false);
  });

  it('maps price sort keys to directions', () => {
    expect(getPriceSortDirection('price-asc')).toBe(1);
    expect(getPriceSortDirection('price-desc')).toBe(-1);
  });
});
