import type { BrowserContext } from '@playwright/test';
import path from 'node:path';

const SEED_MAX_ATTEMPTS = 3;

export async function resetE2eDatabase(context?: BrowserContext): Promise<void> {
  const { execSync } = await import('node:child_process');
  const seedEnv = {
    ...process.env,
    NODE_ENV: 'development',
    MONGO_URI: process.env.MONGO_URI ?? 'mongodb://127.0.0.1:27017/merns-shop'
  };

  for (let attempt = 1; attempt <= SEED_MAX_ATTEMPTS; attempt += 1) {
    try {
      execSync('bash scripts/run-with-project-node.sh run db:seed:inner', {
        stdio: 'pipe',
        cwd: path.resolve(process.cwd()),
        env: seedEnv
      });
      break;
    } catch (error) {
      if (attempt === SEED_MAX_ATTEMPTS) {
        throw new Error(
          `E2E database seed failed after ${SEED_MAX_ATTEMPTS} attempts: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    }
  }

  if (context) {
    await context.clearCookies();
  }
}
