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

  const [
    { default: User },
    { default: Product },
    { default: Order },
    { default: users },
    { default: products }
  ] = await Promise.all([
    import('../../../backend/models/User.js'),
    import('../../../backend/models/Product.js'),
    import('../../../backend/models/Order.js'),
    import('../../../backend/data/users.js'),
    import('../../../backend/data/products.js')
  ]);

  await Order.deleteMany();
  await Product.deleteMany();
  await User.deleteMany();

  const createdUsers = await User.insertMany(users);
  const adminUser = createdUsers[0]?._id;
  if (!adminUser) {
    throw new Error('Seed failed: no admin user created');
  }

  const sampleProducts = products.map((product) => ({ ...product, user: adminUser }));
  await Product.insertMany(sampleProducts);
}
