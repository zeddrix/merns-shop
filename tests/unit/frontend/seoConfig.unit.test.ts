import { describe, expect, it } from 'vitest';
import { getSiteUrl, toAbsoluteUrl } from '../../../frontend/src/constants/seo';

describe('frontend seo config', () => {
  it('getSiteUrl strips trailing slashes', () => {
    expect(getSiteUrl()).not.toMatch(/\/$/);
  });

  it('toAbsoluteUrl joins base and path', () => {
    const url = toAbsoluteUrl('/product/abc');
    expect(url).toMatch(/\/product\/abc$/);
    expect(url.startsWith('http')).toBe(true);
  });

  it('toAbsoluteUrl returns absolute URLs unchanged', () => {
    expect(toAbsoluteUrl('https://example.com/x')).toBe('https://example.com/x');
  });
});
