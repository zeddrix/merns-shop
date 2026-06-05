import { beforeAll, afterAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../../../backend/app.js';
import { connectTestDb, disconnectTestDb, resetTestDb } from '../helpers/db.js';
import { getAuthToken } from '../helpers/auth.js';

describe('products review integration', () => {
  let token = '';

  beforeAll(async () => {
    await connectTestDb();
  });

  afterAll(async () => {
    await disconnectTestDb();
  });

  beforeEach(async () => {
    await resetTestDb();
    token = await getAuthToken(app, 'john@gmail.com', '123456');
  });

  it('POST review persists on product when delivered', async () => {
    const search = await request(app).get('/api/products?keyword=iPhone%2015%20Pro');
    const iphone = search.body.products.find(
      (p: { modelKey?: string }) => p.modelKey === 'iphone-15-pro'
    );
    expect(iphone).toBeDefined();
    const targetId = iphone._id as string;

    const res = await request(app)
      .post(`/api/products/${targetId}/reviews`)
      .set('Authorization', `Bearer ${token}`)
      .send({ rating: 4, comment: 'Integration test review' });

    expect(res.status).toBe(201);

    const product = await request(app).get(`/api/products/${targetId}`);
    expect(product.body.reviews.length).toBeGreaterThan(0);
    expect(
      product.body.reviews.some((r: { comment: string }) => r.comment === 'Integration test review')
    ).toBe(true);
  });

  it('GET product returns canReview for delivered purchase', async () => {
    const search = await request(app).get('/api/products?keyword=iPhone%2015%20Pro');
    const iphone = search.body.products.find(
      (p: { modelKey?: string }) => p.modelKey === 'iphone-15-pro'
    );
    expect(iphone).toBeDefined();

    const res = await request(app)
      .get(`/api/products/${iphone._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.canReview).toBe(true);
    expect(res.body.hasReviewed).toBe(false);
  });

  it('POST review rejected without delivered order', async () => {
    const search = await request(app).get('/api/products?keyword=Amazon%20Echo');
    const withoutOrder = search.body.products.find(
      (p: { modelKey?: string }) => p.modelKey === 'amazon-echo-dot-3-fixture'
    );
    expect(withoutOrder).toBeDefined();

    const res = await request(app)
      .post(`/api/products/${withoutOrder._id}/reviews`)
      .set('Authorization', `Bearer ${token}`)
      .send({ rating: 5, comment: 'Should not post' });

    expect(res.status).toBe(403);
  });
});
