import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../../../backend/app.js';
import Product from '../../../backend/models/Product.js';
import { connectTestDb, disconnectTestDb, resetTestDb } from '../helpers/db.js';

describe('seo routes integration', () => {
  beforeAll(async () => {
    await connectTestDb();
    await resetTestDb();
  });

  afterAll(async () => {
    await disconnectTestDb();
  });

  it('GET /robots.txt returns disallow rules and sitemap line', async () => {
    const res = await request(app).get('/robots.txt');
    expect(res.status).toBe(200);
    expect(res.text).toContain('Disallow: /admin');
    expect(res.text).toContain('Disallow: /cart');
    expect(res.text).toMatch(/Sitemap: https?:\/\//);
  });

  it('GET /sitemap.xml lists home and seeded products', async () => {
    const res = await request(app).get('/sitemap.xml');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/xml/);
    expect(res.text).toContain('<urlset');
    expect(res.text).toMatch(/<loc>https?:\/\/[^<]+\/<\/loc>/);
    expect(res.text).toContain('/about</loc>');

    const iphone = await Product.findOne({ name: 'iPhone 15 Pro' }).select('_id');
    expect(iphone).toBeTruthy();
    expect(res.text).toContain(`/product/${String(iphone?._id)}</loc>`);
  });

  it('responses include security headers from helmet', async () => {
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(200);
    expect(res.headers['x-content-type-options']).toBe('nosniff');
  });
});
