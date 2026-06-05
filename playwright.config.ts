import type { PlaywrightTestConfig } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.join(__dirname, '.env.test'), override: true });

if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'e2e-test-jwt-secret';
}
if (!process.env.MONGO_URI) {
  process.env.MONGO_URI = 'mongodb://127.0.0.1:27017/merns-shop';
}

const CLIENT_URL = 'http://localhost:5020';
const reuseExistingServer = !process.env.CI && process.env.PW_DISABLE_REUSE_SERVER !== '1';

/** Same stack as manual dev: `pnpm dev` → dev:inner (API :5021 + Vite :5020). */
const devStackCommand = process.env.CI
  ? 'pnpm run dev:inner'
  : 'bash scripts/run-with-project-node.sh run dev:inner';

const e2eWebServerEnv: Record<string, string> = {
  NODE_ENV: 'development',
  PORT: '5021',
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  PAYPAL_CLIENT_ID: process.env.PAYPAL_CLIENT_ID ?? ''
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
    command: devStackCommand,
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
  timeout: 120000,
  expect: { timeout: 15000 },
  retries: readEnvInt('PW_RETRIES', 0),
  workers: readEnvInt('PW_WORKERS', 1),
  use: {
    baseURL: CLIENT_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    navigationTimeout: 60000,
    actionTimeout: 30000
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
