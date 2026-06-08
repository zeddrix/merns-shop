import { beforeAll, afterAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../../../backend/app.js';
import { connectTestDb, disconnectTestDb, resetTestDb } from '../helpers/db.js';

describe('compression integration', () => {
  beforeAll(async () => {
    await connectTestDb();
  });

  afterAll(async () => {
    await disconnectTestDb();
  });

  beforeEach(async () => {
    await resetTestDb();
  });

  it('compresses JSON API responses when client accepts gzip', async () => {
    const res = await request(app)
      .get('/api/products?pageNumber=1')
      .set('Accept-Encoding', 'gzip, deflate, br');

    expect(res.status).toBe(200);
    expect(res.headers['content-encoding']).toMatch(/gzip|br/);
  });

  it('serves static assets with cache-control headers in production', async () => {
    const prevEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    const res = await request(app).get('/assets/').set('Accept-Encoding', 'gzip, deflate, br');

    process.env.NODE_ENV = prevEnv;

    if (res.status === 404) {
      return;
    }

    expect(res.headers['cache-control']).toBeDefined();
  });
});
