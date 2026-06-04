import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGO_URI;
if (!uri) {
  console.error('MONGO_URI is required');
  process.exit(1);
}

try {
  await mongoose.connect(uri);
  await mongoose.connection.db?.admin().ping();
  console.log('Atlas/Mongo connection OK:', uri.replace(/\/\/.*@/, '//***@'));
  await mongoose.disconnect();
  process.exit(0);
} catch (error) {
  console.error('Connection failed:', error);
  process.exit(1);
}
