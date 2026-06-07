import { beforeAll, afterAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../../backend/app.js';
import User from '../../../backend/models/User.js';
import PushSubscription from '../../../backend/models/PushSubscription.js';
import { sendOrderNotification } from '../../../backend/services/pushService.js';
import { connectTestDb, disconnectTestDb, resetTestDb } from '../helpers/db.js';
import { getAuthToken } from '../helpers/auth.js';
import { getSendNotificationMock } from '../helpers/web-push-mock.js';
import {
  E2E_VAPID_PRIVATE_KEY,
  E2E_VAPID_PUBLIC_KEY,
  E2E_VAPID_SUBJECT
} from '../../e2e/fixtures/e2e-vapid-keys.js';

describe('push integration', () => {
  let customerToken = '';

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
    customerToken = await getAuthToken(app, 'john@gmail.com', '123456');
  });

  it('returns configured VAPID public key', async () => {
    const response = await request(app).get('/api/push/vapid-public-key');
    expect(response.status).toBe(200);
    expect(response.body.publicKey).toBe(E2E_VAPID_PUBLIC_KEY);
  });

  it('stores subscription and notification preferences', async () => {
    const subscribe = await request(app)
      .post('/api/push/subscribe')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        endpoint: 'https://example.com/push/1',
        expirationTime: null,
        keys: { p256dh: 'test-p256dh', auth: 'test-auth' }
      });
    expect(subscribe.status).toBe(201);

    const preferences = await request(app)
      .put('/api/push/preferences')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ pushEnabled: true, orderPaid: true, orderDelivered: false });
    expect(preferences.status).toBe(200);
    expect(preferences.body.orderDelivered).toBe(false);

    const fetched = await request(app)
      .get('/api/push/preferences')
      .set('Authorization', `Bearer ${customerToken}`);
    expect(fetched.status).toBe(200);
    expect(fetched.body.pushEnabled).toBe(true);
  });

  it('lists in-app notifications for the authenticated user', async () => {
    const list = await request(app)
      .get('/api/push/notifications')
      .set('Authorization', `Bearer ${customerToken}`);
    expect(list.status).toBe(200);
    expect(Array.isArray(list.body)).toBe(true);
  });

  it('removes expired push subscriptions on 410 response', async () => {
    await request(app)
      .post('/api/push/subscribe')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        endpoint: 'https://example.com/push/expired',
        expirationTime: null,
        keys: { p256dh: 'test-p256dh', auth: 'test-auth' }
      });

    await request(app)
      .put('/api/push/preferences')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ pushEnabled: true, orderPaid: true, orderDelivered: true });

    const user = await User.findOne({ email: 'john@gmail.com' });
    expect(user).toBeTruthy();

    getSendNotificationMock().mockRejectedValueOnce({ statusCode: 410 });

    await sendOrderNotification({
      userId: user!._id,
      orderId: new mongoose.Types.ObjectId().toString(),
      type: 'order_paid',
      title: 'Payment confirmed',
      body: 'Your order is paid.',
      url: '/profile'
    });

    expect(getSendNotificationMock()).toHaveBeenCalled();

    const remaining = await PushSubscription.countDocuments({
      endpoint: 'https://example.com/push/expired'
    });
    expect(remaining).toBe(0);
  });
});
