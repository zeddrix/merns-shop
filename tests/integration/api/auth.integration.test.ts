import { beforeAll, afterAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../../../backend/app.js';
import { connectTestDb, disconnectTestDb, resetTestDb } from '../helpers/db.js';

describe('auth integration', () => {
  beforeAll(async () => {
    await connectTestDb();
  });

  afterAll(async () => {
    await disconnectTestDb();
  });

  beforeEach(async () => {
    await resetTestDb();
  });

  it('returns 400 for invalid register payload', async () => {
    const res = await request(app).post('/api/users').send({
      name: '',
      email: 'not-an-email',
      password: '123'
    });
    expect(res.status).toBe(400);
  });

  it('registers a new user', async () => {
    const res = await request(app).post('/api/users').send({
      name: 'Test User',
      email: 'test@example.com',
      password: '123456'
    });
    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
  });

  it('logs in seeded user and returns profile', async () => {
    const login = await request(app).post('/api/users/login').send({
      email: 'john@gmail.com',
      password: '123456'
    });
    expect(login.status).toBe(200);
    expect(login.body.token).toBeDefined();

    const profile = await request(app)
      .get('/api/users/profile')
      .set('Authorization', `Bearer ${login.body.token}`);
    expect(profile.status).toBe(200);
    expect(profile.body.email).toBe('john@gmail.com');
  });

  it('returns 401 for invalid token', async () => {
    const res = await request(app)
      .get('/api/users/profile')
      .set('Authorization', 'Bearer invalid-token');
    expect(res.status).toBe(401);
  });
});
