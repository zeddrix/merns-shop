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

export async function clearPushSubscriptions(userId: string): Promise<void> {
  await withMongoConnection(async () => {
    if (!mongoose.connection.db) {
      throw new Error('Mongo connection unavailable');
    }
    await mongoose.connection.db
      .collection('pushsubscriptions')
      .deleteMany({ user: new mongoose.Types.ObjectId(userId) });
    await mongoose.connection.db
      .collection('notificationpreferences')
      .deleteMany({ user: new mongoose.Types.ObjectId(userId) });
    await mongoose.connection.db
      .collection('notifications')
      .deleteMany({ user: new mongoose.Types.ObjectId(userId) });
  });
}

export async function seedPushSubscription(userId: string, endpoint: string): Promise<void> {
  await withMongoConnection(async () => {
    if (!mongoose.connection.db) {
      throw new Error('Mongo connection unavailable');
    }
    await mongoose.connection.db.collection('pushsubscriptions').updateOne(
      { endpoint },
      {
        $set: {
          user: new mongoose.Types.ObjectId(userId),
          endpoint,
          expirationTime: null,
          keys: {
            p256dh: 'e2e-p256dh-key',
            auth: 'e2e-auth-secret'
          }
        }
      },
      { upsert: true }
    );
    await mongoose.connection.db.collection('notificationpreferences').updateOne(
      { user: new mongoose.Types.ObjectId(userId) },
      {
        $set: {
          pushEnabled: true,
          orderPaid: true,
          orderDelivered: true
        }
      },
      { upsert: true }
    );
  });
}

interface MongoNotification {
  _id: mongoose.Types.ObjectId;
  type: string;
  title: string;
  body: string;
  user: mongoose.Types.ObjectId;
}

export async function findNotificationsByUserId(userId: string): Promise<MongoNotification[]> {
  return withMongoConnection(async () => {
    if (!mongoose.connection.db) {
      throw new Error('Mongo connection unavailable');
    }
    return mongoose.connection.db
      .collection('notifications')
      .find({ user: new mongoose.Types.ObjectId(userId) })
      .toArray() as Promise<MongoNotification[]>;
  });
}
