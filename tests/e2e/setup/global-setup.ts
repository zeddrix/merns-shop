import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assertMongoHealthy, seedDatabase } from '../fixtures/mongo-helpers';

const repoRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../..');

export default async function globalSetup(): Promise<void> {
  if (!process.env.JWT_SECRET) {
    process.env.JWT_SECRET = 'e2e-test-jwt-secret-change-in-ci';
  }

  execSync('node scripts/ensure-product-images.mjs', { cwd: repoRoot, stdio: 'inherit' });

  await assertMongoHealthy();
  await seedDatabase();
}
