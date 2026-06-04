import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../../../backend/app.js';
import { connectTestDb, disconnectTestDb } from '../helpers/db.js';

describe('upload route removed', () => {
  beforeAll(async () => {
    await connectTestDb();
  });

  afterAll(async () => {
    await disconnectTestDb();
  });

  it('returns 404 for legacy POST /api/upload', async () => {
    const res = await request(app)
      .post('/api/upload')
      .attach('image', Buffer.from('fake'), 'test.jpg');
    expect(res.status).toBe(404);
  });
});
