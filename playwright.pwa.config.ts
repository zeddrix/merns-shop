import type { PlaywrightTestConfig } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  E2E_VAPID_PRIVATE_KEY,
  E2E_VAPID_PUBLIC_KEY,
  E2E_VAPID_SUBJECT
} from './tests/e2e/fixtures/e2e-vapid-keys.js';
import { PWA_E2E_PORT, PWA_E2E_URL } from './tests/e2e/config/pwa-ports.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.join(__dirname, '.env.test'), override: true });

if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'e2e-test-jwt-secret';
}
if (!process.env.MONGO_URI) {
  process.env.MONGO_URI = 'mongodb://127.0.0.1:27017/merns-shop';
}

function readEnvInt(name: string, fallback: number): number {
  const raw = process.env[name];
  if (raw === undefined || raw === '') return fallback;
  const n = parseInt(raw, 10);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

const buildCmd =
  'bash scripts/run-with-project-node.sh run build:inner && PORT=5040 NODE_ENV=production bash scripts/run-with-project-node.sh exec node dist/backend/server.js';
const prebuiltServeCmd =
  'PORT=5040 NODE_ENV=production bash scripts/run-with-project-node.sh exec node dist/backend/server.js';
const webServerCommand = process.env.PWA_SERVER_RUNNING ? prebuiltServeCmd : buildCmd;

const config: PlaywrightTestConfig = {
  globalSetup: './tests/e2e/setup/global-setup.ts',
  webServer: {
    command: webServerCommand,
    url: `${PWA_E2E_URL}/api/products`,
    reuseExistingServer: !!process.env.PWA_SERVER_RUNNING,
    timeout: 480000,
    env: {
      ...process.env,
      NODE_ENV: 'production',
      PORT: String(PWA_E2E_PORT),
      JWT_SECRET: process.env.JWT_SECRET,
      MONGO_URI: process.env.MONGO_URI,
      VITE_VAPID_PUBLIC_KEY: process.env.VITE_VAPID_PUBLIC_KEY ?? E2E_VAPID_PUBLIC_KEY,
      VAPID_PUBLIC_KEY: process.env.VAPID_PUBLIC_KEY ?? E2E_VAPID_PUBLIC_KEY,
      VAPID_PRIVATE_KEY: process.env.VAPID_PRIVATE_KEY ?? E2E_VAPID_PRIVATE_KEY,
      VAPID_SUBJECT: process.env.VAPID_SUBJECT ?? E2E_VAPID_SUBJECT,
      PUSH_ENABLED: 'true',
      API_RATE_LIMIT_MAX: '10000',
      AUTH_RATE_LIMIT_MAX: '10000'
    }
  },
  testDir: 'tests/e2e',
  testMatch: /pwa.*\.(test|spec|e2e)\.[jt]s/,
  timeout: 120000,
  expect: { timeout: 20000 },
  retries: readEnvInt('PW_RETRIES', 0),
  workers: readEnvInt('PW_WORKERS', 1),
  use: {
    baseURL: PWA_E2E_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    navigationTimeout: 60000,
    actionTimeout: 30000,
    serviceWorkers: 'allow',
    launchOptions: {
      args: ['--enable-features=WebPush']
    }
  },
  projects: [
    {
      name: 'pwa',
      use: { browserName: 'chromium' }
    }
  ]
};

export default config;
