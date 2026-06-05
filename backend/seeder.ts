import dotenv from 'dotenv';
import connectDB from './config/db.js';
import { destroySeedData, importSeedData } from './utils/importSeedData.js';

dotenv.config();

connectDB();

const runImport = async (): Promise<void> => {
  try {
    await importSeedData();
    console.log('Data imported...');
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

const runDestroy = async (): Promise<void> => {
  try {
    await destroySeedData();
    console.log('Data destroyed...');
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

if (process.argv[2] === '-i') {
  void runImport();
} else if (process.argv[2] === '-d') {
  void runDestroy();
}
