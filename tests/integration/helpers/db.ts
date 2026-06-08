import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../../.env.test') });
dotenv.config({ path: path.join(__dirname, '../../../.env'), override: false });

export async function connectTestDb(): Promise<void> {
  const uri = process.env.MONGO_URI ?? 'mongodb://127.0.0.1:27017/merns-shop';
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(uri);
  }
}

export async function disconnectTestDb(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
}

const SEED_MAX_ATTEMPTS = 3;

let resetLock: Promise<void> = Promise.resolve();

export async function resetTestDb(): Promise<void> {
  const runReset = async (): Promise<void> => {
    await connectTestDb();

    const { importSeedData } = await import('../../../backend/utils/importSeedData.js');
    const Product = (await import('../../../backend/models/Product.js')).default;

    let lastError: unknown;
    for (let attempt = 1; attempt <= SEED_MAX_ATTEMPTS; attempt += 1) {
      try {
        await importSeedData();
        await Product.syncIndexes();
        return;
      } catch (error) {
        lastError = error;
        if (attempt === SEED_MAX_ATTEMPTS) {
          break;
        }
      }
    }

    throw lastError instanceof Error
      ? lastError
      : new Error(`Test database seed failed after ${SEED_MAX_ATTEMPTS} attempts`);
  };

  resetLock = resetLock.catch(() => undefined).then(runReset);
  await resetLock;
}
