export async function resetE2eDatabase(): Promise<void> {
  const { execSync } = await import('node:child_process');
  execSync('pnpm db:seed', {
    stdio: 'pipe',
    env: {
      ...process.env,
      NODE_ENV: 'development',
      MONGO_URI: process.env.MONGO_URI ?? 'mongodb://127.0.0.1:27017/merns-shop'
    }
  });
}
