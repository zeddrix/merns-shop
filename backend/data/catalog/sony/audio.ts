import type { CatalogParentDraft } from '../types.js';
import { catalogImage } from '../helpers.js';

const brand = 'sony';

export const sonyAudio: CatalogParentDraft[] = [
  {
    name: 'Sony WH-1000XM4',
    modelKey: 'sony-wh1000xm4',
    brand: 'Sony',
    category: 'Electronics',
    subcategory: 'Audio',
    pricingCategory: 'Audio',
    releaseYear: 2020,
    description: 'Industry-leading ANC over-ear headphones.',
    image: catalogImage(brand, 'sony-wh1000xm4'),
    variants: [
      { skuSuffix: 'black', label: 'Black', listPrice: 349, countInStock: 12 },
      { skuSuffix: 'silver', label: 'Silver', listPrice: 349, countInStock: 8 }
    ]
  },
  {
    name: 'Sony WH-1000XM5',
    modelKey: 'sony-wh1000xm5',
    brand: 'Sony',
    category: 'Electronics',
    subcategory: 'Audio',
    pricingCategory: 'Audio',
    releaseYear: 2022,
    description: 'Redesigned XM5 with multipoint.',
    image: catalogImage(brand, 'sony-wh1000xm5'),
    variants: [
      { skuSuffix: 'black', label: 'Black', listPrice: 399, countInStock: 14 },
      { skuSuffix: 'silver', label: 'Silver', listPrice: 399, countInStock: 10 }
    ]
  },
  {
    name: 'Sony WH-1000XM6',
    modelKey: 'sony-wh1000xm6',
    brand: 'Sony',
    category: 'Electronics',
    subcategory: 'Audio',
    pricingCategory: 'Audio',
    releaseYear: 2025,
    description: 'Latest Sony flagship noise canceling.',
    image: catalogImage(brand, 'sony-wh1000xm6'),
    variants: [{ skuSuffix: 'black', label: 'Black', listPrice: 449, countInStock: 11 }]
  },
  {
    name: 'Sony WF-1000XM4',
    modelKey: 'sony-wf1000xm4',
    brand: 'Sony',
    category: 'Electronics',
    subcategory: 'Audio',
    pricingCategory: 'Audio',
    releaseYear: 2021,
    description: 'Premium ANC true wireless earbuds.',
    image: catalogImage(brand, 'sony-wf1000xm4'),
    variants: [{ skuSuffix: 'standard', label: 'Standard', listPrice: 279, countInStock: 16 }]
  },
  {
    name: 'Sony WF-1000XM5',
    modelKey: 'sony-wf1000xm5',
    brand: 'Sony',
    category: 'Electronics',
    subcategory: 'Audio',
    pricingCategory: 'Audio',
    releaseYear: 2023,
    description: 'Smaller drivers, bigger sound XM5 buds.',
    image: catalogImage(brand, 'sony-wf1000xm5'),
    variants: [{ skuSuffix: 'standard', label: 'Standard', listPrice: 299, countInStock: 18 }]
  },
  {
    name: 'Sony LinkBuds S',
    modelKey: 'sony-linkbuds-s',
    brand: 'Sony',
    category: 'Electronics',
    subcategory: 'Audio',
    pricingCategory: 'Audio',
    releaseYear: 2022,
    description: 'Compact ANC LinkBuds S.',
    image: catalogImage(brand, 'sony-linkbuds-s'),
    variants: [{ skuSuffix: 'standard', label: 'Standard', listPrice: 199, countInStock: 14 }]
  }
];
