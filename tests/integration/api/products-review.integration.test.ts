import { beforeAll, afterAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../../../backend/app.js';
import { connectTestDb, disconnectTestDb, resetTestDb } from '../helpers/db.js';
import { getAuthToken } from '../helpers/auth.js';
import { getSeededProductId } from '../helpers/products.js';

describe('products review integration', () => {
  let token = '';
  let iphone15ProId = '';

  beforeAll(async () => {
    await connectTestDb();
  });

  afterAll(async () => {
    await disconnectTestDb();
  });

  beforeEach(async () => {
    await resetTestDb();
    token = await getAuthToken(app, 'john@gmail.com', '123456');
    iphone15ProId = await getSeededProductId('iphone-15-pro');
  });

  it('POST review persists on product when delivered', async () => {
    const res = await request(app)
      .post(`/api/products/${iphone15ProId}/reviews`)
      .set('Authorization', `Bearer ${token}`)
      .send({ rating: 4, comment: 'Integration test review' });

    expect(res.status).toBe(201);

    const product = await request(app).get(`/api/products/${iphone15ProId}`);
    expect(product.body.reviews.length).toBeGreaterThan(0);
    expect(
      product.body.reviews.some((r: { comment: string }) => r.comment === 'Integration test review')
    ).toBe(true);
  });

  it('GET product returns canReview for delivered purchase', async () => {
    const res = await request(app)
      .get(`/api/products/${iphone15ProId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.canReview).toBe(true);
    expect(res.body.hasReviewed).toBe(false);
  });

  it('POST review rejected without delivered order', async () => {
    const echoId = await getSeededProductId('amazon-echo-dot-3-fixture');

    const res = await request(app)
      .post(`/api/products/${echoId}/reviews`)
      .set('Authorization', `Bearer ${token}`)
      .send({ rating: 5, comment: 'Should not post' });

    expect(res.status).toBe(403);
  });

  it('duplicate_review_400', async () => {
    const first = await request(app)
      .post(`/api/products/${iphone15ProId}/reviews`)
      .set('Authorization', `Bearer ${token}`)
      .send({ rating: 5, comment: 'First integration review' });
    expect(first.status).toBe(201);

    const duplicate = await request(app)
      .post(`/api/products/${iphone15ProId}/reviews`)
      .set('Authorization', `Bearer ${token}`)
      .send({ rating: 4, comment: 'Duplicate should fail' });
    expect(duplicate.status).toBe(400);
    expect(duplicate.body.message).toMatch(/already reviewed/i);
  });

  it('invalid_review_body_400', async () => {
    const res = await request(app)
      .post(`/api/products/${iphone15ProId}/reviews`)
      .set('Authorization', `Bearer ${token}`)
      .send({ rating: 0, comment: '' });

    expect(res.status).toBe(400);
  });
});
