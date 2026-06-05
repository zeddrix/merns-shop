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

export async function resetTestDb(): Promise<void> {
  await connectTestDb();

  const { importSeedData } = await import('../../../backend/utils/importSeedData.js');
  await importSeedData();
}
