import type { Types } from 'mongoose';
import buildSeedProducts from './catalog/index.js';
import type { SeedProduct } from './catalog/types.js';

export interface SeedCatalogProduct extends SeedProduct {
  user: Types.ObjectId;
}

export const buildSeedCatalog = (adminUserId: Types.ObjectId): SeedCatalogProduct[] =>
  buildSeedProducts({ reviewerUserId: adminUserId }).map((product) => ({
    ...product,
    user: adminUserId
  }));
