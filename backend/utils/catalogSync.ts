import type { Types } from 'mongoose';
import Product, { type IProductDocument } from '../models/Product.js';
import type { SeedReview } from '../data/catalog/types.js';
import type { SeedCatalogProduct } from '../data/buildSeedCatalog.js';
import { averageRating } from '../data/catalog/review-seeds.js';
import { bustCacheKey } from './memoryCache.js';

export interface CatalogSyncOptions {
  reviewerUserId: Types.ObjectId;
}

const recomputeRating = (reviews: SeedReview[]): { rating: number; numReviews: number } => {
  if (reviews.length === 0) {
    return { rating: 0, numReviews: 0 };
  }
  const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
  return {
    rating: Math.round((sum / reviews.length) * 10) / 10,
    numReviews: reviews.length
  };
};

const hasCustomerReviews = (
  reviews: Array<{ user: Types.ObjectId }>,
  reviewerUserId: Types.ObjectId
): boolean => reviews.some((review) => review.user.toString() !== reviewerUserId.toString());

const buildSyncedProductFields = (
  existing: IProductDocument | null,
  seed: SeedCatalogProduct,
  reviewerUserId: Types.ObjectId
): Record<string, unknown> => {
  const keepReviews = existing !== null && hasCustomerReviews(existing.reviews, reviewerUserId);
  const reviews = keepReviews ? existing.reviews : (seed.reviews ?? []);
  const stats = keepReviews
    ? recomputeRating(reviews as SeedReview[])
    : { rating: seed.rating, numReviews: seed.numReviews };

  return {
    name: seed.name,
    image: seed.image,
    brand: seed.brand,
    category: seed.category,
    subcategory: seed.subcategory,
    releaseYear: seed.releaseYear,
    description: seed.description,
    condition: seed.condition,
    variants: seed.variants,
    reviews,
    rating: stats.rating,
    numReviews: stats.numReviews
  };
};

export const syncCatalogProducts = async (
  seedProducts: SeedCatalogProduct[],
  options: CatalogSyncOptions
): Promise<IProductDocument[]> => {
  if (seedProducts.length === 0) {
    return [];
  }

  const modelKeys = seedProducts.map((seed) => seed.modelKey);
  const existingProducts = await Product.find({ modelKey: { $in: modelKeys } });
  const existingByModelKey = new Map(
    existingProducts.map((product) => [product.modelKey, product])
  );

  const bulkOps = [];

  for (const seed of seedProducts) {
    const existing = existingByModelKey.get(seed.modelKey) ?? null;
    const fields = buildSyncedProductFields(existing, seed, options.reviewerUserId);
    const userId = seed.user ?? options.reviewerUserId;

    const candidate = new Product({
      ...fields,
      user: userId,
      modelKey: seed.modelKey
    });
    await candidate.validate();

    bulkOps.push({
      updateOne: {
        filter: { modelKey: seed.modelKey },
        update: {
          $set: fields,
          $setOnInsert: {
            user: userId,
            modelKey: seed.modelKey
          }
        },
        upsert: true
      }
    });
  }

  await Product.bulkWrite(bulkOps, { ordered: false });

  bustCacheKey('product-meta');
  bustCacheKey('products-top');
  bustCacheKey('sitemap-xml');

  const syncedProducts = await Product.find({ modelKey: { $in: modelKeys } });
  const syncedByModelKey = new Map(syncedProducts.map((product) => [product.modelKey, product]));

  return seedProducts.map((seed) => {
    const product = syncedByModelKey.get(seed.modelKey);
    if (!product) {
      throw new Error(`Catalog sync failed for modelKey ${seed.modelKey}`);
    }
    return product;
  });
};

export const averageRatingFromSeedReviews = averageRating;
