import { describe, expect, it } from 'vitest';
import { buildSitemapXml } from '../../../backend/utils/sitemapXml.js';

describe('sitemapXml', () => {
  it('buildSitemapXml produces valid urlset with escaped loc', () => {
    const xml = buildSitemapXml([
      {
        loc: 'https://example.com/product/1',
        changefreq: 'weekly',
        priority: 0.8
      }
    ]);
    expect(xml).toContain('<?xml version="1.0"');
    expect(xml).toContain('<urlset');
    expect(xml).toContain('https://example.com/product/1');
  });
});
