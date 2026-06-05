import type { Types } from 'mongoose';
import Product, { type IProductDocument } from '../models/Product.js';
import type { SeedReview } from '../data/catalog/types.js';
import type { SeedCatalogProduct } from '../data/buildSeedCatalog.js';
import { averageRating } from '../data/catalog/review-seeds.js';

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

const applyCatalogFields = (
  existing: IProductDocument,
  seed: SeedCatalogProduct,
  reviewerUserId: Types.ObjectId
): void => {
  const keepReviews = hasCustomerReviews(existing.reviews, reviewerUserId);
  const reviews = keepReviews ? existing.reviews : (seed.reviews ?? []);
  const stats = keepReviews
    ? recomputeRating(reviews as SeedReview[])
    : { rating: seed.rating, numReviews: seed.numReviews };

  existing.name = seed.name;
  existing.image = seed.image;
  existing.brand = seed.brand;
  existing.category = seed.category;
  existing.subcategory = seed.subcategory;
  existing.releaseYear = seed.releaseYear;
  existing.description = seed.description;
  existing.condition = seed.condition;
  existing.variants = seed.variants as IProductDocument['variants'];
  existing.reviews = reviews as IProductDocument['reviews'];
  existing.rating = stats.rating;
  existing.numReviews = stats.numReviews;
};

export const syncCatalogProducts = async (
  seedProducts: SeedCatalogProduct[],
  options: CatalogSyncOptions
): Promise<IProductDocument[]> => {
  const synced: IProductDocument[] = [];

  for (const seed of seedProducts) {
    const existing = await Product.findOne({ modelKey: seed.modelKey });

    if (!existing) {
      const created = await Product.create({
        ...seed,
        user: seed.user ?? options.reviewerUserId
      });
      synced.push(created);
      continue;
    }

    applyCatalogFields(existing, seed, options.reviewerUserId);
    await existing.save();
    synced.push(existing);
  }

  return synced;
};

export const averageRatingFromSeedReviews = averageRating;
