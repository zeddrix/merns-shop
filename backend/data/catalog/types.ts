export type PricingCategory =
  | 'Phones'
  | 'Tablets'
  | 'Laptops'
  | 'Wearables'
  | 'TVs'
  | 'Consoles'
  | 'Audio';

export interface CatalogVariantDraft {
  skuSuffix: string;
  label: string;
  listPrice: number;
  storageGb?: number;
  screenInches?: number;
  ramGb?: number;
  countInStock?: number;
  image?: string;
}

export interface CatalogParentDraft {
  name: string;
  modelKey: string;
  brand: string;
  category: string;
  subcategory: string;
  pricingCategory: PricingCategory;
  releaseYear: number;
  description: string;
  image: string;
  rating?: number;
  numReviews?: number;
  variants: CatalogVariantDraft[];
}

import type { Types } from 'mongoose';

export interface SeedReview {
  name: string;
  rating: number;
  comment: string;
  user: Types.ObjectId;
}

export interface SeedProduct {
  name: string;
  image: string;
  description: string;
  brand: string;
  category: string;
  subcategory: string;
  modelKey: string;
  releaseYear: number;
  condition: string;
  rating: number;
  numReviews: number;
  reviews?: SeedReview[];
  variants: Array<{
    sku: string;
    label: string;
    storageGb?: number;
    screenInches?: number;
    ramGb?: number;
    listPrice: number;
    price: number;
    countInStock: number;
    image?: string;
  }>;
}
