import { beforeAll, afterAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../../../backend/app.js';
import { connectTestDb, disconnectTestDb, resetTestDb } from '../helpers/db.js';

describe('orders integration', () => {
  let customerToken = '';
  let adminToken = '';
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
    productId = products.body.products[0]._id;

    const customerLogin = await request(app).post('/api/users/login').send({
      email: 'john@gmail.com',
      password: '123456'
    });
    customerToken = customerLogin.body.token;

    const adminLogin = await request(app).post('/api/users/login').send({
      email: 'admin@gmail.com',
      password: '123456'
    });
    adminToken = adminLogin.body.token;
  });

  it('creates order and lists my orders', async () => {
    const product = await request(app).get(`/api/products/${productId}`);

    const order = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        orderItems: [
          {
            name: product.body.name,
            qty: 1,
            image: product.body.image,
            price: product.body.price,
            product: productId
          }
        ],
        shippingAddress: {
          address: '123 St',
          city: 'City',
          postalCode: '12345',
          country: 'US'
        },
        paymentMethod: 'PayPal',
        itemsPrice: product.body.price,
        taxPrice: 0,
        shippingPrice: 0,
        totalPrice: product.body.price
      });

    expect(order.status).toBe(201);

    const myOrders = await request(app)
      .get('/api/orders/myorders')
      .set('Authorization', `Bearer ${customerToken}`);
    expect(myOrders.status).toBe(200);
    expect(myOrders.body.length).toBeGreaterThan(0);
  });

  it('admin can list orders', async () => {
    const res = await request(app).get('/api/orders').set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('marks order paid and delivered', async () => {
    const product = await request(app).get(`/api/products/${productId}`);

    const order = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        orderItems: [
          {
            name: product.body.name,
            qty: 1,
            image: product.body.image,
            price: product.body.price,
            product: productId
          }
        ],
        shippingAddress: {
          address: '123 St',
          city: 'City',
          postalCode: '12345',
          country: 'US'
        },
        paymentMethod: 'PayPal',
        itemsPrice: product.body.price,
        taxPrice: 0,
        shippingPrice: 0,
        totalPrice: product.body.price
      });

    expect(order.status).toBe(201);
    const orderId = order.body._id as string;

    const pay = await request(app)
      .put(`/api/orders/${orderId}/pay`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        id: 'integration-test-payment',
        status: 'COMPLETED',
        update_time: new Date().toISOString(),
        payer: { email_address: 'john@gmail.com' }
      });
    expect(pay.status).toBe(200);
    expect(pay.body.isPaid).toBe(true);

    const deliver = await request(app)
      .put(`/api/orders/${orderId}/deliver`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(deliver.status).toBe(200);
    expect(deliver.body.isDelivered).toBe(true);

    const customerOrder = await request(app)
      .get(`/api/orders/${orderId}`)
      .set('Authorization', `Bearer ${customerToken}`);
    expect(customerOrder.body.isDelivered).toBe(true);
  });
});
