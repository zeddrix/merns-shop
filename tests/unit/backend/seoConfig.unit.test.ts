import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { getSiteUrl, toAbsoluteUrl } from '../../../backend/config/seo.js';

describe('backend seo config', () => {
  const originalSiteUrl = process.env.SITE_URL;

  beforeEach(() => {
    delete process.env.SITE_URL;
  });

  afterEach(() => {
    if (originalSiteUrl === undefined) {
      delete process.env.SITE_URL;
    } else {
      process.env.SITE_URL = originalSiteUrl;
    }
  });

  it('getSiteUrl strips trailing slashes', () => {
    process.env.SITE_URL = 'https://merns-shop.onrender.com/';
    expect(getSiteUrl()).toBe('https://merns-shop.onrender.com');
  });

  it('toAbsoluteUrl joins base and path', () => {
    process.env.SITE_URL = 'https://merns-shop.onrender.com';
    expect(toAbsoluteUrl('/sitemap.xml')).toBe('https://merns-shop.onrender.com/sitemap.xml');
  });
});
