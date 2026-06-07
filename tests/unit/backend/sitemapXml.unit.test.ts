import { describe, expect, it } from 'vitest';
import { buildDefaultSitemapEntries, buildSitemapXml } from '../../../backend/utils/sitemapXml.js';

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

  it('buildDefaultSitemapEntries includes home, about, and products', () => {
    const entries = buildDefaultSitemapEntries([
      { id: 'prod1', updatedAt: new Date('2026-06-01T00:00:00.000Z') }
    ]);
    expect(entries).toHaveLength(3);
    expect(entries[0]?.loc).toMatch(/\/$/);
    expect(entries[1]?.loc).toMatch(/\/about$/);
    expect(entries[1]?.priority).toBe(0.9);
    expect(entries[2]?.loc).toContain('/product/prod1');
  });
});
