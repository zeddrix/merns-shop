import { beforeAll, afterAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../../../backend/app.js';
import { connectTestDb, disconnectTestDb, resetTestDb } from '../helpers/db.js';
import { extractAuthTokenFromLoginResponse, loginAgent } from '../helpers/auth.js';

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

  it('registers a new user and sets auth cookie', async () => {
    const res = await request(app).post('/api/users').send({
      name: 'Test User',
      email: 'test@example.com',
      password: '123456'
    });
    expect(res.status).toBe(201);
    expect(res.body.token).toBeUndefined();
    expect(extractAuthTokenFromLoginResponse(res.headers['set-cookie'])).toBeTruthy();
  });

  it('logs in with cookie session and returns profile', async () => {
    const agent = request.agent(app);
    await loginAgent(agent, 'john@gmail.com', '123456');

    const profile = await agent.get('/api/users/profile');
    expect(profile.status).toBe(200);
    expect(profile.body.email).toBe('john@gmail.com');
  });

  it('logout clears cookie session', async () => {
    const agent = request.agent(app);
    await loginAgent(agent, 'john@gmail.com', '123456');

    const logout = await agent.post('/api/users/logout');
    expect(logout.status).toBe(200);

    const profile = await agent.get('/api/users/profile');
    expect(profile.status).toBe(401);
  });

  it('supports bearer token for API clients', async () => {
    const login = await request(app).post('/api/users/login').send({
      email: 'john@gmail.com',
      password: '123456'
    });
    const token = extractAuthTokenFromLoginResponse(login.headers['set-cookie']);

    const profile = await request(app)
      .get('/api/users/profile')
      .set('Authorization', `Bearer ${token}`);
    expect(profile.status).toBe(200);
  });

  it('returns 401 for invalid token', async () => {
    const res = await request(app)
      .get('/api/users/profile')
      .set('Authorization', 'Bearer invalid-token');
    expect(res.status).toBe(401);
  });
});
