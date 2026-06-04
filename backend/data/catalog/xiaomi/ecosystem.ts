import type { CatalogParentDraft } from '../types.js';
import { catalogImage } from '../helpers.js';

const brand = 'xiaomi';

export const xiaomiEcosystem: CatalogParentDraft[] = [
  {
    name: 'Xiaomi Watch S1',
    modelKey: 'xiaomi-watch-s1',
    brand: 'Xiaomi',
    category: 'Electronics',
    subcategory: 'Wearables',
    pricingCategory: 'Wearables',
    releaseYear: 2022,
    description: 'Premium sapphire Xiaomi smartwatch.',
    image: catalogImage(brand, 'xiaomi-watch-s1'),
    variants: [{ skuSuffix: 'standard', label: 'Standard', listPrice: 199, countInStock: 10 }]
  },
  {
    name: 'Xiaomi Watch 2',
    modelKey: 'xiaomi-watch-2',
    brand: 'Xiaomi',
    category: 'Electronics',
    subcategory: 'Wearables',
    pricingCategory: 'Wearables',
    releaseYear: 2024,
    description: 'Wear OS Xiaomi Watch 2.',
    image: catalogImage(brand, 'xiaomi-watch-2'),
    variants: [
      { skuSuffix: 'bt', label: 'Bluetooth', listPrice: 249, countInStock: 9 },
      { skuSuffix: 'lte', label: 'LTE', listPrice: 299, countInStock: 7 }
    ]
  },
  {
    name: 'Redmi Buds 4 Pro',
    modelKey: 'redmi-buds-4-pro',
    brand: 'Xiaomi',
    category: 'Electronics',
    subcategory: 'Audio',
    pricingCategory: 'Audio',
    releaseYear: 2022,
    description: 'Hi-Res wireless earbuds with ANC.',
    image: catalogImage(brand, 'redmi-buds-4-pro'),
    variants: [{ skuSuffix: 'standard', label: 'Standard', listPrice: 79, countInStock: 20 }]
  },
  {
    name: 'Xiaomi Buds 5 Pro',
    modelKey: 'xiaomi-buds-5-pro',
    brand: 'Xiaomi',
    category: 'Electronics',
    subcategory: 'Audio',
    pricingCategory: 'Audio',
    releaseYear: 2024,
    description: 'Flagship Xiaomi earbuds with LDAC.',
    image: catalogImage(brand, 'xiaomi-buds-5-pro'),
    variants: [{ skuSuffix: 'standard', label: 'Standard', listPrice: 149, countInStock: 15 }]
  }
];
