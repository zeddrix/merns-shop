import type {} from '../backend/types/express.js';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { vi } from 'vitest';

const webPushMock = vi.hoisted(() => ({
  sendNotificationMock: vi.fn().mockResolvedValue(undefined),
  setVapidDetailsMock: vi.fn()
}));

vi.mock('web-push', () => ({
  default: {
    setVapidDetails: webPushMock.setVapidDetailsMock,
    sendNotification: webPushMock.sendNotificationMock
  }
}));

globalThis.__pushSendNotificationMock = webPushMock.sendNotificationMock;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../.env.test') });
dotenv.config({ path: path.join(__dirname, '../../.env'), override: false });

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'vitest-jwt-secret';
process.env.MONGO_URI = process.env.MONGO_URI ?? 'mongodb://127.0.0.1:27017/merns-shop';
