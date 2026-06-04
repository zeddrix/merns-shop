import { beforeAll, afterAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../../../backend/app.js';
import { connectTestDb, disconnectTestDb, resetTestDb } from '../helpers/db.js';

describe('products review integration', () => {
  let productId = '';
  let token = '';

  beforeAll(async () => {
    await connectTestDb();
  });

  afterAll(async () => {
    await disconnectTestDb();
  });

  beforeEach(async () => {
    await resetTestDb();
    const products = await request(app).get('/api/products');
    productId = products.body.products[0]._id;

    const login = await request(app).post('/api/users/login').send({
      email: 'john@gmail.com',
      password: '123456'
    });
    token = login.body.token;
  });

  it('POST review persists on product', async () => {
    const res = await request(app)
      .post(`/api/products/${productId}/reviews`)
      .set('Authorization', `Bearer ${token}`)
      .send({ rating: 4, comment: 'Integration test review' });

    expect(res.status).toBe(201);

    const product = await request(app).get(`/api/products/${productId}`);
    expect(product.body.reviews.length).toBeGreaterThan(0);
    expect(product.body.reviews[0].comment).toBe('Integration test review');
  });
});
