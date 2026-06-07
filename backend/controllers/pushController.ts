import asyncHandler from 'express-async-handler';
import type { Request, Response } from 'express';
import PushSubscription from '../models/PushSubscription.js';
import NotificationPreference from '../models/NotificationPreference.js';
import Notification from '../models/Notification.js';
import { getVapidPublicKey } from '../services/pushService.js';

const getPublicKey = asyncHandler(async (_req: Request, res: Response) => {
  const publicKey = getVapidPublicKey();
  if (!publicKey) {
    res.status(503);
    throw new Error('Push notifications are not configured');
  }
  res.json({ publicKey });
});

const subscribe = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401);
    throw new Error('Not authorized');
  }

  const { endpoint, expirationTime, keys } = req.body as {
    endpoint?: string;
    expirationTime?: number | null;
    keys?: { p256dh?: string; auth?: string };
  };

  if (!endpoint || !keys?.p256dh || !keys.auth) {
    res.status(400);
    throw new Error('Invalid subscription payload');
  }

  await PushSubscription.findOneAndUpdate(
    { endpoint },
    {
      user: req.user._id,
      endpoint,
      expirationTime: expirationTime ?? null,
      keys: {
        p256dh: keys.p256dh,
        auth: keys.auth
      }
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  res.status(201).json({ message: 'Subscribed' });
});

const unsubscribe = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401);
    throw new Error('Not authorized');
  }

  const { endpoint } = req.body as { endpoint?: string };
  if (!endpoint) {
    res.status(400);
    throw new Error('Endpoint is required');
  }

  await PushSubscription.deleteOne({ user: req.user._id, endpoint });
  res.json({ message: 'Unsubscribed' });
});

const getPreferences = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401);
    throw new Error('Not authorized');
  }

  const preference =
    (await NotificationPreference.findOne({ user: req.user._id })) ??
    (await NotificationPreference.create({
      user: req.user._id,
      pushEnabled: false,
      orderPaid: true,
      orderDelivered: true
    }));

  res.json(preference);
});

const updatePreferences = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401);
    throw new Error('Not authorized');
  }

  const { pushEnabled, orderPaid, orderDelivered } = req.body as {
    pushEnabled?: boolean;
    orderPaid?: boolean;
    orderDelivered?: boolean;
  };

  const preference = await NotificationPreference.findOneAndUpdate(
    { user: req.user._id },
    {
      pushEnabled: pushEnabled ?? false,
      orderPaid: orderPaid ?? true,
      orderDelivered: orderDelivered ?? true
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  res.json(preference);
});

const listNotifications = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401);
    throw new Error('Not authorized');
  }

  const notifications = await Notification.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(20);
  res.json(notifications);
});

const markNotificationRead = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401);
    throw new Error('Not authorized');
  }

  const notification = await Notification.findOne({
    _id: req.params.id,
    user: req.user._id
  });

  if (!notification) {
    res.status(404);
    throw new Error('Notification not found');
  }

  notification.read = true;
  await notification.save();
  res.json(notification);
});

export {
  getPublicKey,
  subscribe,
  unsubscribe,
  getPreferences,
  updatePreferences,
  listNotifications,
  markNotificationRead
};
