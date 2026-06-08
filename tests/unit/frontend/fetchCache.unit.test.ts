import { afterEach, describe, expect, it } from 'vitest';
import {
  buildCacheKey,
  bustCache,
  clearFetchCacheForTests,
  getCached,
  setCached
} from '../../../frontend/src/utils/fetchCache';

describe('fetchCache', () => {
  afterEach(() => {
    clearFetchCacheForTests();
  });

  it('returns null for missing keys', () => {
    expect(getCached('/api/products')).toBeNull();
  });

  it('stores and retrieves values within TTL', () => {
    setCached('/api/products', { page: 1 }, 60_000);
    expect(getCached<{ page: number }>('/api/products')).toEqual({ page: 1 });
  });

  it('expires entries after TTL', () => {
    setCached('/api/products/meta', ['Apple'], 1);
    const entry = getCached<string[]>('/api/products/meta');
    expect(entry).toEqual(['Apple']);

    const future = Date.now() + 10;
    const originalNow = Date.now;
    Date.now = () => future;
    expect(getCached('/api/products/meta')).toBeNull();
    Date.now = originalNow;
  });

  it('builds stable cache keys from params', () => {
    expect(buildCacheKey('/api/products', { pageNumber: 2, keyword: 'iphone' })).toBe(
      '/api/products?keyword=iphone&pageNumber=2'
    );
  });

  it('busts keys by prefix', () => {
    setCached('/api/products?page=1', { ok: true }, 60_000);
    setCached('/api/products/top', { ok: true }, 60_000);
    setCached('/api/users/profile', { ok: true }, 60_000);

    bustCache('/api/products');

    expect(getCached('/api/products?page=1')).toBeNull();
    expect(getCached('/api/products/top')).toBeNull();
    expect(getCached('/api/users/profile')).toEqual({ ok: true });
  });
});
