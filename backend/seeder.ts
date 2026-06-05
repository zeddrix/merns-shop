import dotenv from 'dotenv';
import users from './data/users.js';
import buildSeedProducts from './data/catalog/index.js';
import { insertSeedOrders } from './data/seed-orders.js';
import User from './models/User.js';
import Product from './models/Product.js';
import Order from './models/Order.js';
import connectDB from './config/db.js';

dotenv.config();

connectDB();

const importData = async (): Promise<void> => {
  try {
    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();

    const createdUsers = await User.insertMany(users);

    const adminUser = createdUsers[0]._id;
    const sampleProducts = buildSeedProducts({
      reviewerUserId: adminUser
    }).map((product) => ({ ...product, user: adminUser }));

    const insertedProducts = await Product.insertMany(sampleProducts);
    await insertSeedOrders(createdUsers, insertedProducts);

    console.log('Data imported...');
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

const deleteData = async (): Promise<void> => {
  try {
    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();

    console.log('Data destroyed...');
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

if (process.argv[2] === '-i') {
  importData();
} else if (process.argv[2] === '-d') {
  deleteData();
}
