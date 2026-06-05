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
    expect(res.body.products.length).toBeLessThanOrEqual(12);
    expect(res.body.page).toBe(1);
    expect(res.body.products[0].variants).toBeDefined();
    expect(res.body.products[0].priceFrom).toBeDefined();
  });

  it('searches products by keyword', async () => {
    const res = await request(app).get('/api/products?keyword=iPhone');
    expect(res.status).toBe(200);
    expect(res.body.products.length).toBeGreaterThan(0);
  });

  it('filters products by max price', async () => {
    const res = await request(app).get('/api/products?maxPrice=50&pageNumber=1');
    expect(res.status).toBe(200);
    expect(res.body.products.length).toBeGreaterThan(0);
    for (const product of res.body.products) {
      expect(product.priceFrom).toBeLessThanOrEqual(50);
    }
  });

  it('filters products by brand', async () => {
    const res = await request(app).get('/api/products?brand=Apple&pageNumber=1');
    expect(res.status).toBe(200);
    expect(res.body.products.every((p: { brand: string }) => p.brand === 'Apple')).toBe(true);
  });

  it('returns product meta', async () => {
    const res = await request(app).get('/api/products/meta');
    expect(res.status).toBe(200);
    expect(res.body.brands).toContain('Apple');
    expect(res.body.subcategories).toContain('Phones');
  });

  it('admin can create update and delete product', async () => {
    const productPayload = {
      name: 'Integration Test Product',
      image: '/images/sample.jpg',
      brand: 'Test Brand',
      category: 'Electronics',
      subcategory: 'Phones',
      modelKey: 'integration-test-phone',
      releaseYear: 2024,
      description: 'Created during integration test',
      variants: [
        {
          sku: 'integration-test-128gb',
          label: '128GB',
          listPrice: 99,
          price: 69,
          countInStock: 5
        }
      ]
    };

    const created = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(productPayload);
    expect(created.status).toBe(201);

    const updated = await request(app)
      .put(`/api/products/${created.body._id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        ...productPayload,
        name: 'Updated Name',
        variants: [{ ...productPayload.variants[0], price: 59 }]
      });
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

  it('returns embedded reviews on seeded product detail', async () => {
    const list = await request(app).get('/api/products?keyword=iPhone%2015%20Pro');
    expect(list.status).toBe(200);
    const iphone15Pro = list.body.products.find(
      (p: { name: string }) => p.name === 'iPhone 15 Pro'
    );
    expect(iphone15Pro).toBeDefined();

    const productId = iphone15Pro._id as string;
    const detail = await request(app).get(`/api/products/${productId}`);
    expect(detail.status).toBe(200);
    expect(Array.isArray(detail.body.reviews)).toBe(true);
    expect(detail.body.reviews.length).toBeGreaterThan(0);
    expect(detail.body.reviews[0].name).toBeDefined();
    expect(detail.body.reviews[0].rating).toBeGreaterThanOrEqual(1);
  });
});
