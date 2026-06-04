import mongoose from 'mongoose';

export async function assertMongoHealthy(): Promise<void> {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error('MONGO_URI is required for E2E tests');
  }

  await mongoose.connect(uri);
  await mongoose.connection.db?.admin().ping();
  await mongoose.disconnect();
}

export async function seedDatabase(): Promise<void> {
  const { execSync } = await import('node:child_process');
  execSync('pnpm db:seed', {
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: 'development',
      MONGO_URI: process.env.MONGO_URI ?? 'mongodb://127.0.0.1:27017/merns-shop'
    }
  });
}
