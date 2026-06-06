import users from '../data/users.js';
import { buildSeedCatalog } from '../data/buildSeedCatalog.js';
import { insertSeedOrders, insertMissingSeedOrders } from '../data/seed-orders.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import { assertDestructiveSeedAllowed, logDestructiveSeedSummary } from './seedSafety.js';
import { syncCatalogProducts } from './catalogSync.js';
import type { IProductDocument } from '../models/Product.js';

export interface ImportSeedResult {
  users: Array<{ _id: import('mongoose').Types.ObjectId; email: string }>;
  products: IProductDocument[];
}

export const importSeedData = async (): Promise<ImportSeedResult> => {
  assertDestructiveSeedAllowed(process.env.MONGO_URI);

  await Order.deleteMany();
  await Product.deleteMany();
  await User.deleteMany();

  const createdUsers = await User.insertMany(users);
  const adminUser = createdUsers[0];
  if (!adminUser) {
    throw new Error('Seed failed: no admin user created');
  }

  const catalog = buildSeedCatalog(adminUser._id);
  const products = await Product.insertMany(catalog);
  await insertSeedOrders(createdUsers, products);

  return {
    users: createdUsers.map((user) => ({ _id: user._id, email: user.email })),
    products: products as unknown as IProductDocument[]
  };
};

export const syncCatalogOnly = async (): Promise<IProductDocument[]> => {
  let adminUser = await User.findOne({ email: 'admin@gmail.com' });
  if (!adminUser) {
    await User.insertMany(users);
    adminUser = await User.findOne({ email: 'admin@gmail.com' });
  }
  if (!adminUser) {
    throw new Error('Catalog sync failed: admin user missing');
  }

  const catalog = buildSeedCatalog(adminUser._id);
  return syncCatalogProducts(catalog, { reviewerUserId: adminUser._id });
};

export const syncFixturesOnly = async (): Promise<void> => {
  for (const seedUser of users) {
    await User.findOneAndUpdate(
      { email: seedUser.email },
      {
        name: seedUser.name,
        email: seedUser.email,
        password: seedUser.password,
        isAdmin: seedUser.isAdmin ?? false
      },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    );
  }

  const allUsers = await User.find();
  const products = await Product.find();
  await insertMissingSeedOrders(allUsers, products);
};

export const destroySeedData = async (): Promise<void> => {
  assertDestructiveSeedAllowed(process.env.MONGO_URI);

  logDestructiveSeedSummary({
    orders: await Order.countDocuments(),
    products: await Product.countDocuments(),
    users: await User.countDocuments(),
    productsAction: 'delete'
  });

  await Order.deleteMany();
  await Product.deleteMany();
  await User.deleteMany();
};
