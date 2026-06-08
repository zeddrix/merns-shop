import { beforeAll, afterAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../../../backend/app.js';
import { connectTestDb, disconnectTestDb, resetTestDb } from '../helpers/db.js';
import { clearMemoryCacheForTests } from '../../../backend/utils/memoryCache.js';

describe('product meta integration', () => {
  beforeAll(async () => {
    await connectTestDb();
  });

  afterAll(async () => {
    await disconnectTestDb();
  });

  beforeEach(async () => {
    clearMemoryCacheForTests();
    await resetTestDb();
  });

  it('returns filter metadata and caches subsequent responses', async () => {
    const first = await request(app).get('/api/products/meta');
    expect(first.status).toBe(200);
    expect(Array.isArray(first.body.brands)).toBe(true);
    expect(first.headers['x-cache']).toBe('MISS');

    const second = await request(app).get('/api/products/meta');
    expect(second.status).toBe(200);
    expect(second.headers['x-cache']).toBe('HIT');
    expect(second.body.brands).toEqual(first.body.brands);
  });
});
