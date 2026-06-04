import { beforeAll, afterAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../../../backend/app.js';
import { connectTestDb, disconnectTestDb, resetTestDb } from '../helpers/db.js';
import { getAuthToken } from '../helpers/auth.js';

describe('users admin integration', () => {
  let adminToken = '';

  beforeAll(async () => {
    await connectTestDb();
  });

  afterAll(async () => {
    await disconnectTestDb();
  });

  beforeEach(async () => {
    await resetTestDb();
    adminToken = await getAuthToken(app, 'admin@gmail.com', '123456');
  });

  it('admin lists users', async () => {
    const res = await request(app).get('/api/users').set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('admin gets user by id', async () => {
    const users = await request(app).get('/api/users').set('Authorization', `Bearer ${adminToken}`);
    expect(users.status).toBe(200);
    const userId = users.body[0]._id;

    const res = await request(app)
      .get(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body._id).toBe(userId);
  });

  it('admin_cannot_delete_own_account', async () => {
    const users = await request(app).get('/api/users').set('Authorization', `Bearer ${adminToken}`);
    const adminUser = users.body.find(
      (user: { email: string }) => user.email === 'admin@gmail.com'
    );

    const res = await request(app)
      .delete(`/api/users/${adminUser._id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(400);
  });

  it('admin_edits_user_via_api', async () => {
    const users = await request(app).get('/api/users').set('Authorization', `Bearer ${adminToken}`);
    const john = users.body.find((user: { email: string }) => user.email === 'john@gmail.com');

    const res = await request(app)
      .put(`/api/users/${john._id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'John API Updated', email: john.email, isAdmin: false });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('John API Updated');
  });

  it('admin_deletes_user_via_api', async () => {
    const users = await request(app).get('/api/users').set('Authorization', `Bearer ${adminToken}`);
    const jane = users.body.find((user: { email: string }) => user.email === 'jane@gmail.com');

    const res = await request(app)
      .delete(`/api/users/${jane._id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);

    const remaining = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(remaining.body.some((user: { email: string }) => user.email === 'jane@gmail.com')).toBe(
      false
    );
  });
});
