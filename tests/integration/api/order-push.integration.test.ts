import { beforeAll, afterAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../../../backend/app.js';
import { connectTestDb, disconnectTestDb, resetTestDb } from '../helpers/db.js';
import { getAuthToken } from '../helpers/auth.js';
import { getSendNotificationMock } from '../helpers/web-push-mock.js';
import {
  E2E_VAPID_PRIVATE_KEY,
  E2E_VAPID_PUBLIC_KEY,
  E2E_VAPID_SUBJECT
} from '../../e2e/fixtures/e2e-vapid-keys.js';

function buildOrderPayload(
  product: {
    _id: string;
    variants: Array<{ sku: string; price: number; countInStock: number }>;
  },
  productId: string
) {
  const variant = product.variants.find((v) => v.countInStock > 0) ?? product.variants[0];
  return {
    orderItems: [{ product: productId, qty: 1, variantSku: variant.sku }],
    shippingAddress: {
      address: '123 St',
      city: 'City',
      postalCode: '12345',
      country: 'US'
    },
    paymentMethod: 'PayPal'
  };
}

describe('order push integration', () => {
  let customerToken = '';
  let adminToken = '';
  let productId = '';

  beforeAll(async () => {
    process.env.VAPID_PUBLIC_KEY = E2E_VAPID_PUBLIC_KEY;
    process.env.VAPID_PRIVATE_KEY = E2E_VAPID_PRIVATE_KEY;
    process.env.VAPID_SUBJECT = E2E_VAPID_SUBJECT;
    process.env.PUSH_ENABLED = 'true';
    await connectTestDb();
  });

  afterAll(async () => {
    await disconnectTestDb();
  });

  beforeEach(async () => {
    getSendNotificationMock().mockClear();
    getSendNotificationMock().mockResolvedValue(undefined);
    await resetTestDb();

    const products = await request(app).get('/api/products');
    const inStockProduct =
      products.body.products.find((p: { inStock?: boolean }) => p.inStock !== false) ??
      products.body.products[0];
    productId = inStockProduct._id;

    customerToken = await getAuthToken(app, 'john@gmail.com', '123456');
    adminToken = await getAuthToken(app, 'admin@gmail.com', '123456');

    await request(app)
      .post('/api/push/subscribe')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        endpoint: 'https://example.com/push/order',
        expirationTime: null,
        keys: { p256dh: 'test-p256dh', auth: 'test-auth' }
      });

    await request(app)
      .put('/api/push/preferences')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ pushEnabled: true, orderPaid: true, orderDelivered: true });
  });

  it('sends push when order is paid and delivered', async () => {
    const product = await request(app).get(`/api/products/${productId}`);
    const created = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send(buildOrderPayload(product.body, productId));
    expect(created.status).toBe(201);
    const orderId = created.body._id as string;

    const paid = await request(app)
      .put(`/api/orders/${orderId}/pay`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        id: 'pay-id',
        status: 'COMPLETED',
        update_time: new Date().toISOString(),
        payer: { email_address: 'john@gmail.com' }
      });
    expect(paid.status).toBe(200);
    expect(getSendNotificationMock()).toHaveBeenCalled();

    getSendNotificationMock().mockClear();

    const delivered = await request(app)
      .put(`/api/orders/${orderId}/deliver`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(delivered.status).toBe(200);
    expect(getSendNotificationMock()).toHaveBeenCalled();

    const notifications = await request(app)
      .get('/api/push/notifications')
      .set('Authorization', `Bearer ${customerToken}`);
    expect(notifications.status).toBe(200);
    expect(
      notifications.body.some(
        (item: { type: string }) => item.type === 'order_paid' || item.type === 'order_delivered'
      )
    ).toBe(true);
    expect(notifications.body.length).toBeGreaterThanOrEqual(2);
  });

  it('skips web-push when push notifications are disabled', async () => {
    await request(app)
      .put('/api/push/preferences')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ pushEnabled: false, orderPaid: true, orderDelivered: true });

    const product = await request(app).get(`/api/products/${productId}`);
    const created = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send(buildOrderPayload(product.body, productId));
    expect(created.status).toBe(201);

    await request(app)
      .put(`/api/orders/${created.body._id}/pay`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        id: 'pay-id',
        status: 'COMPLETED',
        update_time: new Date().toISOString(),
        payer: { email_address: 'john@gmail.com' }
      });

    expect(getSendNotificationMock()).not.toHaveBeenCalled();

    const notifications = await request(app)
      .get('/api/push/notifications')
      .set('Authorization', `Bearer ${customerToken}`);
    expect(notifications.body.some((item: { type: string }) => item.type === 'order_paid')).toBe(
      true
    );
  });
});
