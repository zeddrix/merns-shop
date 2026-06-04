import { describe, expect, it } from 'vitest';
import { Types } from 'mongoose';
import {
  buildProductBotHtml,
  buildRobotsTxt,
  buildSeoHtmlDocument
} from '../../../backend/utils/seoHtml.js';
import type { IProductDocument } from '../../../backend/models/Product.js';

const sampleProduct = {
  _id: new Types.ObjectId(),
  name: 'iPhone 15 Pro',
  image: '/images/catalog/iphone.jpg',
  description: 'Titanium design, A17 Pro, and Action button.',
  variants: [{ sku: 'sku-1', label: '128GB', listPrice: 999, price: 899, countInStock: 3 }],
  brand: 'Apple',
  category: 'Phones',
  subcategory: 'Smartphones',
  modelKey: 'iphone-15-pro',
  releaseYear: 2023,
  condition: 'New',
  reviews: [],
  rating: 4,
  numReviews: 1,
  user: new Types.ObjectId()
} as unknown as IProductDocument;

describe('seoHtml utilities', () => {
  it('buildSeoHtmlDocument escapes HTML in title', () => {
    const html = buildSeoHtmlDocument({
      title: 'Test <script>',
      description: 'Safe description',
      canonicalPath: '/product/1'
    });
    expect(html).toContain('Test &lt;script&gt;');
    expect(html).not.toContain('<script>alert');
  });

  it('buildRobotsTxt includes disallow rules and sitemap', () => {
    const robots = buildRobotsTxt();
    expect(robots).toContain('Disallow: /admin');
    expect(robots).toContain('Disallow: /login');
    expect(robots).toMatch(/Sitemap: https?:\/\//);
  });

  it('buildProductBotHtml includes product name in og:title', () => {
    const html = buildProductBotHtml(sampleProduct);
    expect(html).toContain('iPhone 15 Pro');
    expect(html).toContain('og:title');
  });
});
