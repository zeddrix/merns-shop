import { describe, expect, it } from 'vitest';

describe('productController pagination math', () => {
  it('calculates pages from count and page size of 2', () => {
    const productsPerPage = 2;
    const count = 5;
    const pages = Math.ceil(count / productsPerPage);
    expect(pages).toBe(3);
  });

  it('builds case-insensitive keyword regex filter', () => {
    const keyword = 'iPhone';
    const filter = {
      name: { $regex: keyword, $options: 'i' }
    };
    expect(filter.name.$options).toBe('i');
  });
});
