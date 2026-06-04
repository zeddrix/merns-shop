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

function readEnvInt(name: string, fallback: number): number {
  const raw = process.env[name];
  if (raw === undefined || raw === '') return fallback;
  const n = parseInt(raw, 10);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

const config: PlaywrightTestConfig = {
  globalSetup: './tests/e2e/setup/global-setup.ts',
  globalTeardown: './tests/e2e/setup/global-teardown.ts',
  webServer: [
    {
      command: 'pnpm exec tsx backend/server.ts',
      port: 5000,
      reuseExistingServer: !process.env.CI && process.env.PW_DISABLE_REUSE_SERVER !== '1',
      timeout: 120000,
      env: {
        ...process.env,
        NODE_ENV: 'development',
        PORT: '5000',
        MONGO_URI: process.env.MONGO_URI,
        JWT_SECRET: process.env.JWT_SECRET
      }
    },
    {
      command: 'pnpm --filter merns-shop-frontend dev --port 5173 --strictPort',
      port: 5173,
      reuseExistingServer: !process.env.CI && process.env.PW_DISABLE_REUSE_SERVER !== '1',
      timeout: 120000
    }
  ],
  testDir: 'tests/e2e',
  testMatch: /(.+\.)?(test|spec|e2e)\.[jt]s/,
  timeout: 120000,
  expect: { timeout: 15000 },
  retries: readEnvInt('PW_RETRIES', 0),
  workers: readEnvInt('PW_WORKERS', 1),
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    navigationTimeout: 60000,
    actionTimeout: 30000
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' }
    }
  ]
};

export default config;
