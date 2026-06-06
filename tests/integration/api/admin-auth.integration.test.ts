import { beforeAll, afterAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../../../backend/app.js';
import { connectTestDb, disconnectTestDb, resetTestDb } from '../helpers/db.js';
import { getAuthToken } from '../helpers/auth.js';

describe('admin auth integration', () => {
  let customerToken = '';
  let productId = '';

  beforeAll(async () => {
    await connectTestDb();
  });

  afterAll(async () => {
    await disconnectTestDb();
  });

  beforeEach(async () => {
    await resetTestDb();

    const products = await request(app).get('/api/products');
    productId = products.body.products[0]._id as string;
    customerToken = await getAuthToken(app, 'john@gmail.com', '123456');
  });

  it('customer token blocked from POST products', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        name: 'Blocked Product',
        image: '/images/sample.jpg',
        brand: 'Test Brand',
        category: 'Electronics',
        subcategory: 'Phones',
        modelKey: 'blocked-product',
        releaseYear: 2024,
        description: 'Should not be created',
        variants: [
          {
            sku: 'blocked-128gb',
            label: '128GB',
            listPrice: 99,
            price: 69,
            countInStock: 5
          }
        ]
      });

    expect(res.status).toBe(401);
  });

  it('customer token blocked from PUT products', async () => {
    const res = await request(app)
      .put(`/api/products/${productId}`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ name: 'Hacked Name' });

    expect(res.status).toBe(401);
  });

  it('customer token blocked from DELETE products', async () => {
    const res = await request(app)
      .delete(`/api/products/${productId}`)
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.status).toBe(401);
  });

  it('customer token blocked from GET admin orders', async () => {
    const res = await request(app)
      .get('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.status).toBe(401);
  });

  it('customer token blocked from GET admin users', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.status).toBe(401);
  });
});
