import type { PlaywrightTestConfig } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { E2E_API_PORT, E2E_CLIENT_PORT, E2E_CLIENT_URL } from './tests/e2e/config/e2e-ports.js';
import {
  E2E_VAPID_PRIVATE_KEY,
  E2E_VAPID_PUBLIC_KEY,
  E2E_VAPID_SUBJECT
} from './tests/e2e/fixtures/e2e-vapid-keys.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.join(__dirname, '.env.test'), override: true });

if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'e2e-test-jwt-secret';
}
if (!process.env.MONGO_URI) {
  process.env.MONGO_URI = 'mongodb://127.0.0.1:27017/merns-shop';
}

const CLIENT_URL = E2E_CLIENT_URL;
const reuseExistingServer = !process.env.CI && process.env.PW_DISABLE_REUSE_SERVER !== '1';

/** Dedicated E2E stack on :5030/:5031 — separate from manual `pnpm dev` (:5020/:5021). */
const e2eStackCommand = process.env.CI
  ? 'pnpm run dev:e2e:inner'
  : 'bash scripts/run-with-project-node.sh run dev:e2e:inner';

const e2eWebServerEnv: Record<string, string> = {
  NODE_ENV: 'development',
  PORT: String(E2E_API_PORT),
  VITE_DEV_PORT: String(E2E_CLIENT_PORT),
  VITE_SITE_URL: E2E_CLIENT_URL,
  SITE_URL: `http://localhost:${E2E_API_PORT}`,
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  PAYPAL_CLIENT_ID: process.env.PAYPAL_CLIENT_ID ?? '',
  VITE_VAPID_PUBLIC_KEY: process.env.VITE_VAPID_PUBLIC_KEY ?? E2E_VAPID_PUBLIC_KEY,
  VAPID_PUBLIC_KEY: process.env.VAPID_PUBLIC_KEY ?? E2E_VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY: process.env.VAPID_PRIVATE_KEY ?? E2E_VAPID_PRIVATE_KEY,
  VAPID_SUBJECT: process.env.VAPID_SUBJECT ?? E2E_VAPID_SUBJECT,
  PUSH_ENABLED: process.env.PUSH_ENABLED ?? 'true',
  API_RATE_LIMIT_MAX: process.env.API_RATE_LIMIT_MAX ?? '10000',
  AUTH_RATE_LIMIT_MAX: process.env.AUTH_RATE_LIMIT_MAX ?? '10000'
};

function readEnvInt(name: string, fallback: number): number {
  const raw = process.env[name];
  if (raw === undefined || raw === '') return fallback;
  const n = parseInt(raw, 10);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

const paypalRetries = readEnvInt('PW_PAYPAL_RETRIES', readEnvInt('PW_RETRIES', 1));

const config: PlaywrightTestConfig = {
  globalSetup: './tests/e2e/setup/global-setup.ts',
  globalTeardown: './tests/e2e/setup/global-teardown.ts',
  webServer: {
    command: e2eStackCommand,
    url: `${CLIENT_URL}/api/products`,
    reuseExistingServer,
    timeout: 120000,
    env: {
      ...process.env,
      ...e2eWebServerEnv
    }
  },
  testDir: 'tests/e2e',
  testMatch: /(.+\.)?(test|spec|e2e)\.[jt]s/,
  testIgnore: /pwa.*\.(test|spec|e2e)\.[jt]s/,
  timeout: 120000,
  expect: { timeout: 15000 },
  retries: readEnvInt('PW_RETRIES', 0),
  workers: readEnvInt('PW_WORKERS', 1),
  use: {
    baseURL: CLIENT_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    navigationTimeout: 60000,
    actionTimeout: 30000,
    serviceWorkers: 'block'
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
      grepInvert: /@paypal/
    },
    {
      name: 'paypal',
      use: { browserName: 'chromium' },
      grep: /@paypal/,
      fullyParallel: false,
      retries: paypalRetries,
      workers: 1,
      ...(process.env.PW_PAYPAL_ONLY !== '1' ? { dependencies: ['chromium' as const] } : {})
    }
  ]
};

export default config;
