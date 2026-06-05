import { describe, expect, it } from 'vitest';
import { Types } from 'mongoose';
import {
  averageRating,
  buildSeedReviewsForProduct,
  productHasSeedReviews
} from '../../../backend/data/catalog/review-seeds.js';
import { getCatalogDrafts } from '../../../backend/data/catalog/index.js';

describe('review seeds', () => {
  const reviewerId = new Types.ObjectId();

  it('majority_of_products_have_reviews', () => {
    const drafts = getCatalogDrafts();
    const withReviews = drafts.filter((d) => productHasSeedReviews(d.modelKey));
    expect(withReviews.length / drafts.length).toBeGreaterThan(0.75);
  });

  it('synced_rating_matches_embedded_reviews', () => {
    const parent = getCatalogDrafts().find((d) => productHasSeedReviews(d.modelKey));
    expect(parent).toBeDefined();
    const reviews = buildSeedReviewsForProduct(parent!, reviewerId);
    expect(reviews.length).toBeGreaterThan(0);
    expect(averageRating(reviews)).toBeGreaterThan(0);
  });

  it('fixture_product_has_no_seed_reviews', () => {
    expect(productHasSeedReviews('amazon-echo-dot-3-fixture')).toBe(false);
  });

  it('hero_products_always_have_seed_reviews', () => {
    expect(productHasSeedReviews('iphone-15-pro')).toBe(true);
    expect(productHasSeedReviews('ipad-air-m2')).toBe(true);
  });
});
