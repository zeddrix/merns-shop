import { beforeAll, afterAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../../../backend/app.js';
import { connectTestDb, disconnectTestDb, resetTestDb } from '../helpers/db.js';
import { getAuthToken } from '../helpers/auth.js';

function buildOrderPayload(
  product: {
    _id: string;
    variants: Array<{ sku: string; price: number; countInStock: number }>;
  },
  productId: string
) {
  const variant = product.variants.find((v) => v.countInStock > 0) ?? product.variants[0];
  return {
    orderItems: [
      {
        product: productId,
        qty: 1,
        variantSku: variant.sku
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
    const inStockProduct =
      products.body.products.find((p: { inStock?: boolean }) => p.inStock !== false) ??
      products.body.products[0];
    productId = inStockProduct._id;

    customerToken = await getAuthToken(app, 'john@gmail.com', '123456');
    otherCustomerToken = await getAuthToken(app, 'jane@gmail.com', '123456');
    adminToken = await getAuthToken(app, 'admin@gmail.com', '123456');
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
    expect(Array.isArray(myOrders.body.orders)).toBe(true);
    expect(myOrders.body.orders.length).toBeGreaterThan(0);
    expect(myOrders.body.page).toBe(1);
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

  it('get_order_by_id_requires_auth', async () => {
    const product = await request(app).get(`/api/products/${productId}`);
    const order = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send(buildOrderPayload(product.body, productId));

    const orderId = order.body._id as string;

    const unauthenticated = await request(app).get(`/api/orders/${orderId}`);
    expect(unauthenticated.status).toBe(401);
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
    expect(Array.isArray(res.body.orders)).toBe(true);
    expect(res.body.total).toBeGreaterThan(0);
  });

  it('paginates admin orders by page and limit', async () => {
    const pageOne = await request(app)
      .get('/api/orders?page=1&limit=1')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(pageOne.status).toBe(200);
    expect(pageOne.body.orders).toHaveLength(1);
    expect(pageOne.body.pages).toBeGreaterThanOrEqual(1);
  });

  it('creates multi-item order with batched product lookup', async () => {
    const list = await request(app).get('/api/products?pageNumber=1');
    const inStock = list.body.products.filter((p: { inStock?: boolean }) => p.inStock !== false);
    expect(inStock.length).toBeGreaterThan(1);

    const first = inStock[0];
    const second = inStock[1];
    const firstProduct = await request(app).get(`/api/products/${first._id}`);
    const secondProduct = await request(app).get(`/api/products/${second._id}`);
    const firstVariant = firstProduct.body.variants.find(
      (v: { countInStock: number }) => v.countInStock > 0
    );
    const secondVariant = secondProduct.body.variants.find(
      (v: { countInStock: number }) => v.countInStock > 0
    );

    const order = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        orderItems: [
          { product: first._id, qty: 1, variantSku: firstVariant.sku },
          { product: second._id, qty: 1, variantSku: secondVariant.sku }
        ],
        shippingAddress: {
          address: '123 St',
          city: 'City',
          postalCode: '12345',
          country: 'US'
        },
        paymentMethod: 'PayPal'
      });

    expect(order.status).toBe(201);
    expect(order.body.orderItems).toHaveLength(2);
  });

  it('pay_with_missing_payer_returns_400', async () => {
    const product = await request(app).get(`/api/products/${productId}`);
    const order = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send(buildOrderPayload(product.body, productId));

    const orderId = order.body._id as string;

    const invalidPay = await request(app)
      .put(`/api/orders/${orderId}/pay`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        id: 'bad-payment',
        status: 'COMPLETED',
        update_time: new Date().toISOString()
      });

    expect(invalidPay.status).toBe(400);
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

  it('order_404', async () => {
    const res = await request(app)
      .get('/api/orders/507f1f77bcf86cd799439011')
      .set('Authorization', `Bearer ${customerToken}`);
    expect(res.status).toBe(404);
  });

  it('pay_already_paid_400', async () => {
    const product = await request(app).get(`/api/products/${productId}`);
    const order = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send(buildOrderPayload(product.body, productId));

    const orderId = order.body._id as string;
    const paymentPayload = {
      id: 'integration-test-payment',
      status: 'COMPLETED',
      update_time: new Date().toISOString(),
      payer: { email_address: 'john@gmail.com' }
    };

    const firstPay = await request(app)
      .put(`/api/orders/${orderId}/pay`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send(paymentPayload);
    expect(firstPay.status).toBe(200);

    const secondPay = await request(app)
      .put(`/api/orders/${orderId}/pay`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send(paymentPayload);
    expect(secondPay.status).toBe(400);
    expect(secondPay.body.message).toMatch(/already paid/i);
  });

  it('deliver_already_delivered_400', async () => {
    const product = await request(app).get(`/api/products/${productId}`);
    const order = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send(buildOrderPayload(product.body, productId));

    const orderId = order.body._id as string;

    await request(app)
      .put(`/api/orders/${orderId}/pay`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        id: 'integration-deliver-payment',
        status: 'COMPLETED',
        update_time: new Date().toISOString(),
        payer: { email_address: 'john@gmail.com' }
      });

    const firstDeliver = await request(app)
      .put(`/api/orders/${orderId}/deliver`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(firstDeliver.status).toBe(200);

    const secondDeliver = await request(app)
      .put(`/api/orders/${orderId}/deliver`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(secondDeliver.status).toBe(400);
    expect(secondDeliver.body.message).toMatch(/already delivered/i);
  });

  it('create_order_insufficient_stock', async () => {
    const search = await request(app).get('/api/products?keyword=Amazon%20Echo');
    const outOfStock = search.body.products.find(
      (p: { modelKey?: string }) => p.modelKey === 'amazon-echo-dot-3-fixture'
    );
    expect(outOfStock).toBeDefined();

    const product = await request(app).get(`/api/products/${outOfStock._id}`);
    const variant = product.body.variants[0];

    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        orderItems: [
          {
            product: outOfStock._id,
            qty: 1,
            variantSku: variant.sku
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
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/insufficient stock/i);
  });
});
