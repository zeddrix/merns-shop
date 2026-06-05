import type { CatalogParentDraft } from '../types.js';
import { catalogImage } from '../helpers.js';

const brand = 'sony';

export const sonyAudio: CatalogParentDraft[] = [
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
