import type { BrowserContext } from '@playwright/test';
import path from 'node:path';

export async function resetE2eDatabase(context?: BrowserContext): Promise<void> {
  const { execSync } = await import('node:child_process');
  execSync('bash scripts/run-with-project-node.sh run db:seed:inner', {
    stdio: 'pipe',
    cwd: path.resolve(process.cwd()),
    env: {
      ...process.env,
      NODE_ENV: 'development',
      MONGO_URI: process.env.MONGO_URI ?? 'mongodb://127.0.0.1:27017/merns-shop'
    }
  });

  if (context) {
    await context.clearCookies();
  }
}
