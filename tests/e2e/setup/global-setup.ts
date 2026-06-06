import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assertMongoHealthy, seedDatabase } from '../fixtures/mongo-helpers';
import { hasPayPalSandboxCreds } from '../fixtures/paypal-env';

const repoRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const CLIENT_URL = 'http://localhost:5020';

async function assertPayPalApiConfiguredWhenRequired(): Promise<void> {
  if (!hasPayPalSandboxCreds()) {
    return;
  }

  let response: Response | undefined;
  try {
    response = await fetch(`${CLIENT_URL}/api/config/paypal`, {
      signal: AbortSignal.timeout(3000)
    });
  } catch {
    // Playwright globalSetup runs before webServer; preflight runs when reusing an existing dev stack.
    return;
  }

  const clientId = (await response.text()).trim();
  if (!response.ok || clientId.length < 10) {
    throw new Error(
      'PayPal E2E preflight failed: PAYPAL_CLIENT_ID is missing on the running API. Add it to `.env` when reusing `pnpm dev`, or stop dev and run with PW_DISABLE_REUSE_SERVER=1 so Playwright loads `.env.test`.'
    );
  }
}

export default async function globalSetup(): Promise<void> {
  if (!process.env.JWT_SECRET) {
    process.env.JWT_SECRET = 'e2e-test-jwt-secret-change-in-ci';
  }

  execSync('node scripts/ensure-product-images.mjs', { cwd: repoRoot, stdio: 'inherit' });

  await assertMongoHealthy();
  await seedDatabase();
  await assertPayPalApiConfiguredWhenRequired();
}
