import { getSiteUrl } from '../config/seo.js';

export interface SitemapUrlEntry {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

const escapeXml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

export const buildSitemapXml = (entries: SitemapUrlEntry[]): string => {
  const urlNodes = entries
    .map((entry) => {
      const parts = [`<loc>${escapeXml(entry.loc)}</loc>`];
      if (entry.lastmod) {
        parts.push(`<lastmod>${escapeXml(entry.lastmod)}</lastmod>`);
      }
      if (entry.changefreq) {
        parts.push(`<changefreq>${entry.changefreq}</changefreq>`);
      }
      if (entry.priority !== undefined) {
        parts.push(`<priority>${entry.priority.toFixed(1)}</priority>`);
      }
      return `<url>${parts.join('')}</url>`;
    })
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urlNodes}</urlset>`;
};

export const buildDefaultSitemapEntries = (
  productPaths: Array<{ id: string; updatedAt?: Date }>
): SitemapUrlEntry[] => {
  const siteUrl = getSiteUrl();
  const home: SitemapUrlEntry = {
    loc: `${siteUrl}/`,
    changefreq: 'daily',
    priority: 1
  };

  const products: SitemapUrlEntry[] = productPaths.map((product) => ({
    loc: `${siteUrl}/product/${product.id}`,
    lastmod: product.updatedAt?.toISOString(),
    changefreq: 'weekly',
    priority: 0.8
  }));

  return [home, ...products];
};
