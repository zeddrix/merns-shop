import mongoose from 'mongoose';

const DEFAULT_URI = 'mongodb://127.0.0.1:27017/merns-shop';

function getMongoUri(): string {
  const uri = process.env.MONGO_URI ?? DEFAULT_URI;
  if (!uri) {
    throw new Error('MONGO_URI is required for E2E tests');
  }
  return uri;
}

export async function withMongoConnection<T>(fn: () => Promise<T>): Promise<T> {
  const uri = getMongoUri();
  await mongoose.connect(uri);
  try {
    return await fn();
  } finally {
    await mongoose.disconnect();
  }
}

export async function assertMongoHealthy(): Promise<void> {
  await withMongoConnection(async () => {
    await mongoose.connection.db?.admin().ping();
  });
}

export async function seedDatabase(): Promise<void> {
  const { execSync } = await import('node:child_process');
  execSync('pnpm db:seed', {
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: 'development',
      MONGO_URI: getMongoUri()
    }
  });
}

interface MongoOrder {
  _id: mongoose.Types.ObjectId;
  isPaid?: boolean;
  isDelivered?: boolean;
}

interface MongoProduct {
  _id: mongoose.Types.ObjectId;
  name: string;
  reviews?: Array<{ comment: string; rating: number }>;
}

interface MongoUser {
  _id: mongoose.Types.ObjectId;
  email: string;
  name: string;
  isAdmin?: boolean;
}

export async function findOrderById(orderId: string): Promise<MongoOrder | null> {
  return withMongoConnection(async () => {
    if (!mongoose.connection.db) {
      throw new Error('Mongo connection unavailable');
    }

    return mongoose.connection.db.collection('orders').findOne({
      _id: new mongoose.Types.ObjectId(orderId)
    }) as Promise<MongoOrder | null>;
  });
}

export async function findProductById(productId: string): Promise<MongoProduct | null> {
  return withMongoConnection(async () => {
    if (!mongoose.connection.db) {
      throw new Error('Mongo connection unavailable');
    }

    return mongoose.connection.db.collection('products').findOne({
      _id: new mongoose.Types.ObjectId(productId)
    }) as Promise<MongoProduct | null>;
  });
}

export async function findUserByEmail(email: string): Promise<MongoUser | null> {
  return withMongoConnection(async () => {
    if (!mongoose.connection.db) {
      throw new Error('Mongo connection unavailable');
    }

    return mongoose.connection.db
      .collection('users')
      .findOne({ email }) as Promise<MongoUser | null>;
  });
}
