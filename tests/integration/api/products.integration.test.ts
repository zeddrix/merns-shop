import { beforeAll, afterAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../../../backend/app.js';
import { connectTestDb, disconnectTestDb, resetTestDb } from '../helpers/db.js';
import { getAuthToken } from '../helpers/auth.js';

describe('products integration', () => {
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

    await request(app).get('/api/products');
  });

  it('lists products with pagination', async () => {
    const res = await request(app).get('/api/products?pageNumber=1');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.products)).toBe(true);
    expect(res.body.page).toBe(1);
  });

  it('searches products by keyword', async () => {
    const res = await request(app).get('/api/products?keyword=iPhone');
    expect(res.status).toBe(200);
    expect(res.body.products.length).toBeGreaterThan(0);
  });

  it('admin can create update and delete product', async () => {
    const productPayload = {
      name: 'Integration Test Product',
      price: 29.99,
      image: '/images/sample.jpg',
      brand: 'Test Brand',
      category: 'Electronics',
      description: 'Created during integration test',
      countInStock: 5
    };

    const created = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(productPayload);
    expect(created.status).toBe(201);

    const updated = await request(app)
      .put(`/api/products/${created.body._id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ ...created.body, name: 'Updated Name', price: 10 });
    expect(updated.status).toBe(200);
    expect(updated.body.name).toBe('Updated Name');

    const deleted = await request(app)
      .delete(`/api/products/${created.body._id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(deleted.status).toBe(200);
  });

  it('gets top products', async () => {
    const res = await request(app).get('/api/products/top');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
