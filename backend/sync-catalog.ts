import dotenv from 'dotenv';
import connectDB from './config/db.js';
import { syncCatalogOnly, syncFixturesOnly } from './utils/importSeedData.js';

dotenv.config();

connectDB();

const run = async (): Promise<void> => {
  const fixturesOnly = process.argv.includes('--fixtures');
  const catalogOnly = process.argv.includes('--catalog');

  try {
    if (fixturesOnly && !catalogOnly) {
      await syncFixturesOnly();
      console.log('Fixture data synced...');
    } else if (catalogOnly && !fixturesOnly) {
      const products = await syncCatalogOnly();
      console.log(`Catalog synced (${products.length} products)...`);
    } else {
      const products = await syncCatalogOnly();
      await syncFixturesOnly();
      console.log(`Catalog and fixtures synced (${products.length} products)...`);
    }
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

void run();
