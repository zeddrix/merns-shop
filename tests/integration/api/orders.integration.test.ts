import { beforeAll, afterAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../../../backend/app.js';
import { connectTestDb, disconnectTestDb, resetTestDb } from '../helpers/db.js';

function buildOrderPayload(
  product: { _id: string; name: string; image: string; price: number },
  productId: string
) {
  return {
    orderItems: [
      {
        name: product.name,
        qty: 1,
        image: product.image,
        price: product.price,
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
    itemsPrice: 0.01,
    taxPrice: 0,
    shippingPrice: 0,
    totalPrice: 0.01
  };
}

describe('orders integration', () => {
  let customerToken = '';
  let otherCustomerToken = '';
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

    const otherLogin = await request(app).post('/api/users/login').send({
      email: 'jane@gmail.com',
      password: '123456'
    });
    otherCustomerToken = otherLogin.body.token;

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
      .send(buildOrderPayload(product.body, productId));

    expect(order.status).toBe(201);
    expect(order.body.totalPrice).toBeGreaterThan(0.01);

    const myOrders = await request(app)
      .get('/api/orders/myorders')
      .set('Authorization', `Bearer ${customerToken}`);
    expect(myOrders.status).toBe(200);
    expect(myOrders.body.length).toBeGreaterThan(0);
  });

  it('create_order_rejects_tampered_total_price via server-side pricing', async () => {
    const product = await request(app).get(`/api/products/${productId}`);

    const order = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send(buildOrderPayload(product.body, productId));

    expect(order.status).toBe(201);
    expect(order.body.totalPrice).not.toBe(0.01);
  });

  it('customer_cannot_read_other_users_order', async () => {
    const product = await request(app).get(`/api/products/${productId}`);
    const order = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send(buildOrderPayload(product.body, productId));

    const orderId = order.body._id as string;

    const forbidden = await request(app)
      .get(`/api/orders/${orderId}`)
      .set('Authorization', `Bearer ${otherCustomerToken}`);

    expect(forbidden.status).toBe(401);
  });

  it('customer_cannot_pay_other_users_order', async () => {
    const product = await request(app).get(`/api/products/${productId}`);
    const order = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send(buildOrderPayload(product.body, productId));

    const orderId = order.body._id as string;

    const forbidden = await request(app)
      .put(`/api/orders/${orderId}/pay`)
      .set('Authorization', `Bearer ${otherCustomerToken}`)
      .send({
        id: 'bad-payment',
        status: 'COMPLETED',
        update_time: new Date().toISOString(),
        payer: { email_address: 'jane@gmail.com' }
      });

    expect(forbidden.status).toBe(401);
  });

  it('admin_cannot_deliver_unpaid_order', async () => {
    const product = await request(app).get(`/api/products/${productId}`);
    const order = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send(buildOrderPayload(product.body, productId));

    const orderId = order.body._id as string;

    const deliver = await request(app)
      .put(`/api/orders/${orderId}/deliver`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(deliver.status).toBe(400);
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
      .send(buildOrderPayload(product.body, productId));

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
