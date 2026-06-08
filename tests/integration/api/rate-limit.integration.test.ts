import { beforeAll, afterAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../../../backend/app.js';
import { connectTestDb, disconnectTestDb, resetTestDb } from '../helpers/db.js';

describe('rate limit integration', () => {
  const previousMax = process.env.AUTH_RATE_LIMIT_MAX;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    await connectTestDb();
  });

  afterAll(async () => {
    if (previousMax === undefined) {
      delete process.env.AUTH_RATE_LIMIT_MAX;
    } else {
      process.env.AUTH_RATE_LIMIT_MAX = previousMax;
    }
    await disconnectTestDb();
  });

  beforeEach(async () => {
    await resetTestDb();
  });

  it('allows normal login volume in test environment', async () => {
    process.env.AUTH_RATE_LIMIT_MAX = '10000';
    const res = await request(app).post('/api/users/login').send({
      email: 'admin@gmail.com',
      password: '123456'
    });

    expect(res.status).toBe(200);
    expect(res.body.email).toBe('admin@gmail.com');
  });

  it('returns 429 after repeated failed login attempts when strict limit enabled', async () => {
    process.env.AUTH_RATE_LIMIT_MAX = '2';
    const clientIp = '203.0.113.42';

    for (let attempt = 0; attempt < 2; attempt += 1) {
      const attemptRes = await request(app)
        .post('/api/users/login')
        .set('X-Forwarded-For', clientIp)
        .send({
          email: 'admin@gmail.com',
          password: 'wrong-password'
        });
      expect(attemptRes.status).toBe(401);
    }

    const blocked = await request(app)
      .post('/api/users/login')
      .set('X-Forwarded-For', clientIp)
      .send({
        email: 'admin@gmail.com',
        password: 'wrong-password'
      });

    expect(blocked.status).toBe(429);
  });
});
