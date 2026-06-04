import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../../../backend/app.js';
import { connectTestDb, disconnectTestDb, resetTestDb } from '../helpers/db.js';

describe('spa fallback integration', () => {
  beforeAll(async () => {
    await connectTestDb();
    await resetTestDb();
  });

  afterAll(async () => {
    await disconnectTestDb();
  });

  it('returns API products in non-production mode', async () => {
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(200);
    expect(res.body.products).toBeDefined();
  });
});
