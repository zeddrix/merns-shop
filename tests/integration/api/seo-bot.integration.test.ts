import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import express from 'express';
import request from 'supertest';
import Product from '../../../backend/models/Product.js';
import { DEFAULT_META_TITLE } from '../../../backend/constants/brand.js';
import { seoBotMiddleware } from '../../../backend/middleware/seoBotMiddleware.js';
import { connectTestDb, disconnectTestDb, resetTestDb } from '../helpers/db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, '../../../backend/frontend/dist');
const distIndexPath = path.join(distDir, 'index.html');

const GOOGLEBOT_UA = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';

const createProductionLikeApp = () => {
  const app = express();
  app.use(seoBotMiddleware);
  app.use(express.static(distDir));
  app.get('/{*splat}', (_req, res) => {
    res.sendFile(distIndexPath);
  });
  return app;
};

describe('seo bot integration (production middleware)', () => {
  let prodLikeApp: express.Express;
  let hadDistIndex = false;
  let originalDistIndex: string | null = null;

  beforeAll(async () => {
    if (fs.existsSync(distIndexPath)) {
      hadDistIndex = true;
      originalDistIndex = fs.readFileSync(distIndexPath, 'utf8');
    } else {
      fs.mkdirSync(distDir, { recursive: true });
    }
    fs.writeFileSync(distIndexPath, '<!doctype html><html><body>SPA index</body></html>');

    prodLikeApp = createProductionLikeApp();
    await connectTestDb();
    await resetTestDb();
  });

  afterAll(async () => {
    await disconnectTestDb();

    if (hadDistIndex && originalDistIndex !== null) {
      fs.writeFileSync(distIndexPath, originalDistIndex);
    } else if (fs.existsSync(distIndexPath)) {
      fs.unlinkSync(distIndexPath);
      if (fs.existsSync(distDir) && fs.readdirSync(distDir).length === 0) {
        fs.rmdirSync(distDir);
      }
    }
  });

  it('serves bot HTML for Googlebot on /', async () => {
    const res = await request(prodLikeApp).get('/').set('User-Agent', GOOGLEBOT_UA);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/html/);
    expect(res.text).toContain(DEFAULT_META_TITLE);
    expect(res.text).toContain('schema.org');
  });

  it('serves product bot HTML for Googlebot on /product/:id', async () => {
    const iphone = await Product.findOne({ name: 'iPhone 15 Pro' }).select('_id name');
    expect(iphone).toBeTruthy();

    const res = await request(prodLikeApp)
      .get(`/product/${String(iphone?._id)}`)
      .set('User-Agent', GOOGLEBOT_UA);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/html/);
    expect(res.text).toContain('iPhone 15 Pro');
    expect(res.text).toContain('"@type":"Product"');
  });

  it('serves SPA index for normal browser on non-API routes', async () => {
    const res = await request(prodLikeApp)
      .get('/cart')
      .set(
        'User-Agent',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36'
      );

    expect(res.status).toBe(200);
    expect(res.text).toContain('SPA index');
  });
});
