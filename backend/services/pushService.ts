import webpush from 'web-push';
import PushSubscription from '../models/PushSubscription.js';
import NotificationPreference from '../models/NotificationPreference.js';
import Notification, { type NotificationType } from '../models/Notification.js';
import type { Types } from 'mongoose';

let vapidConfigured = false;

const configureVapid = (): boolean => {
  if (vapidConfigured) {
    return true;
  }

  const publicKey = process.env.VAPID_PUBLIC_KEY ?? process.env.VITE_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT ?? 'mailto:support@merns-shop.test';

  if (!publicKey || !privateKey) {
    return false;
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);
  vapidConfigured = true;
  return true;
};

export const isPushEnabled = (): boolean =>
  process.env.PUSH_ENABLED !== 'false' && configureVapid();

export interface OrderNotificationPayload {
  userId: Types.ObjectId | string;
  orderId: string;
  type: NotificationType;
  title: string;
  body: string;
  url: string;
}

export const sendOrderNotification = async (payload: OrderNotificationPayload): Promise<void> => {
  const userId = String(payload.userId);

  await Notification.create({
    user: userId,
    type: payload.type,
    title: payload.title,
    body: payload.body,
    url: payload.url,
    orderId: payload.orderId,
    read: false
  });

  if (!isPushEnabled()) {
    return;
  }

  const preference = await NotificationPreference.findOne({ user: userId });
  if (!preference?.pushEnabled) {
    return;
  }

  if (payload.type === 'order_paid' && !preference.orderPaid) {
    return;
  }

  if (payload.type === 'order_delivered' && !preference.orderDelivered) {
    return;
  }

  const subscriptions = await PushSubscription.find({ user: userId });
  const pushPayload = JSON.stringify({
    title: payload.title,
    body: payload.body,
    tag: payload.type,
    url: payload.url
  });

  for (const subscription of subscriptions) {
    try {
      await webpush.sendNotification(
        {
          endpoint: subscription.endpoint,
          expirationTime: subscription.expirationTime ?? undefined,
          keys: subscription.keys
        },
        pushPayload
      );
    } catch (error) {
      const statusCode =
        typeof error === 'object' &&
        error !== null &&
        'statusCode' in error &&
        typeof error.statusCode === 'number'
          ? error.statusCode
          : undefined;

      if (statusCode === 404 || statusCode === 410) {
        await PushSubscription.deleteOne({ _id: subscription._id });
      }
    }
  }
};

export const getVapidPublicKey = (): string | null =>
  process.env.VAPID_PUBLIC_KEY ?? process.env.VITE_VAPID_PUBLIC_KEY ?? null;
