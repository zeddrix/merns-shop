import { beforeAll, afterAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../../../backend/app.js';
import { connectTestDb, disconnectTestDb, resetTestDb } from '../helpers/db.js';

describe('upload auth integration', () => {
  beforeAll(async () => {
    await connectTestDb();
  });

  afterAll(async () => {
    await disconnectTestDb();
  });

  beforeEach(async () => {
    await resetTestDb();
  });

  it('returns 401 for unauthenticated upload', async () => {
    const res = await request(app)
      .post('/api/upload')
      .attach('image', Buffer.from('fake'), 'test.jpg');
    expect(res.status).toBe(401);
  });

  it('allows admin upload with token', async () => {
    const login = await request(app).post('/api/users/login').send({
      email: 'admin@gmail.com',
      password: '123456'
    });

    const res = await request(app)
      .post('/api/upload')
      .set('Authorization', `Bearer ${login.body.token}`)
      .attach('image', Buffer.from('fake-image-data'), {
        filename: 'test.jpg',
        contentType: 'image/jpeg'
      });

    expect(res.status).toBe(200);
    expect(res.text).toContain('/uploads/');
  });
});
