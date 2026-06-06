import { describe, expect, it, vi, beforeEach } from 'vitest';
import { Types } from 'mongoose';
import Product from '../../../backend/models/Product.js';
import { syncCatalogProducts } from '../../../backend/utils/catalogSync.js';
import type { SeedCatalogProduct } from '../../../backend/data/buildSeedCatalog.js';

const reviewerId = new Types.ObjectId();
const customerId = new Types.ObjectId();

const baseSeed = (): SeedCatalogProduct => ({
  user: reviewerId,
  name: 'iPhone 15 Pro',
  image: '/images/sample.jpg',
  description: 'Updated seed description for QA.',
  brand: 'Apple',
  category: 'Electronics',
  subcategory: 'Phones',
  modelKey: 'iphone-15-pro',
  releaseYear: 2023,
  condition: 'Like New',
  rating: 4.5,
  numReviews: 2,
  reviews: [
    {
      name: 'Seed Reviewer',
      rating: 5,
      comment: 'Seed review comment',
      user: reviewerId
    }
  ],
  variants: [
    {
      sku: 'iphone-15-pro-128gb',
      label: '128GB',
      listPrice: 999,
      price: 799,
      countInStock: 8
    }
  ]
});

const makeExisting = (overrides: Record<string, unknown> = {}) => ({
  _id: new Types.ObjectId(),
  modelKey: 'iphone-15-pro',
  name: 'Old Name',
  image: '/images/old.jpg',
  description: 'Old description',
  brand: 'Apple',
  category: 'Electronics',
  subcategory: 'Phones',
  releaseYear: 2023,
  condition: 'Like New',
  rating: 0,
  numReviews: 0,
  reviews: [],
  variants: baseSeed().variants,
  user: reviewerId,
  ...overrides
});

vi.mock('../../../backend/models/Product.js', () => {
  class MockProduct {
    validate = vi.fn().mockResolvedValue(undefined);

    constructor(_data: Record<string, unknown>) {}
  }

  const ProductModel =
    MockProduct as unknown as typeof import('../../../backend/models/Product.js').default;
  ProductModel.find = vi.fn();
  ProductModel.bulkWrite = vi.fn();

  return { default: ProductModel };
});

describe('catalogSync', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('upserts_new_product_by_model_key', async () => {
    const created = { _id: new Types.ObjectId(), modelKey: 'iphone-15-pro' };
    vi.mocked(Product.find)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([created as never]);

    const result = await syncCatalogProducts([baseSeed()], { reviewerUserId: reviewerId });

    expect(Product.bulkWrite).toHaveBeenCalledWith(
      [
        expect.objectContaining({
          updateOne: expect.objectContaining({
            filter: { modelKey: 'iphone-15-pro' },
            update: expect.objectContaining({
              $set: expect.objectContaining({ name: 'iPhone 15 Pro' }),
              $setOnInsert: expect.objectContaining({ modelKey: 'iphone-15-pro' })
            })
          })
        })
      ],
      { ordered: false }
    );
    expect(result).toHaveLength(1);
    expect(result[0]).toBe(created);
  });

  it('updates_description_without_changing_id', async () => {
    const existing = makeExisting();
    const updated = { ...existing, description: 'Updated seed description for QA.' };
    vi.mocked(Product.find)
      .mockResolvedValueOnce([existing as never])
      .mockResolvedValueOnce([updated as never]);

    const result = await syncCatalogProducts([baseSeed()], { reviewerUserId: reviewerId });

    expect(Product.bulkWrite).toHaveBeenCalled();
    expect(result[0]._id).toBe(existing._id);
    expect(result[0].description).toBe('Updated seed description for QA.');
  });

  it('preserves_customer_reviews_when_syncing', async () => {
    const customerReview = {
      name: 'John',
      rating: 4,
      comment: 'Customer review',
      user: customerId
    };
    const existing = makeExisting({
      reviews: [customerReview],
      rating: 4,
      numReviews: 1
    });
    const synced = {
      ...existing,
      description: 'Updated seed description for QA.'
    };
    vi.mocked(Product.find)
      .mockResolvedValueOnce([existing as never])
      .mockResolvedValueOnce([synced as never]);

    const result = await syncCatalogProducts([baseSeed()], { reviewerUserId: reviewerId });

    const bulkCall = vi.mocked(Product.bulkWrite).mock.calls[0]?.[0] as unknown as Array<{
      updateOne: { update: { $set: { reviews: unknown[] } } };
    }>;
    expect(bulkCall?.[0]?.updateOne.update.$set.reviews).toEqual([customerReview]);
    expect(result[0].reviews).toEqual([customerReview]);
    expect(result[0].rating).toBe(4);
    expect(result[0].numReviews).toBe(1);
    expect(result[0].description).toBe('Updated seed description for QA.');
  });

  it('replaces_seed_only_reviews_when_no_customer_reviews', async () => {
    const existing = makeExisting({
      reviews: [
        {
          name: 'Admin',
          rating: 3,
          comment: 'Old seed only',
          user: reviewerId
        }
      ]
    });
    const synced = {
      ...existing,
      description: 'Updated seed description for QA.',
      reviews: baseSeed().reviews,
      rating: 4.5,
      numReviews: 2
    };
    vi.mocked(Product.find)
      .mockResolvedValueOnce([existing as never])
      .mockResolvedValueOnce([synced as never]);

    const result = await syncCatalogProducts([baseSeed()], { reviewerUserId: reviewerId });

    expect(result[0].reviews).toHaveLength(1);
    expect((result[0].reviews as Array<{ comment: string }>)[0]?.comment).toBe(
      'Seed review comment'
    );
    expect(result[0].rating).toBe(4.5);
    expect(result[0].numReviews).toBe(2);
  });
});
