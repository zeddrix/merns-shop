import type { CatalogParentDraft } from '../types.js';
import { catalogImage } from '../helpers.js';

const apple = 'apple';

export const appleAirpods: CatalogParentDraft[] = [
  {
    name: 'AirPods (2nd generation)',
    modelKey: 'airpods-2',
    brand: 'Apple',
    category: 'Electronics',
    subcategory: 'Audio',
    pricingCategory: 'Wearables',
    releaseYear: 2019,
    description: 'Classic AirPods with H1 chip and charging case.',
    image: catalogImage(apple, 'airpods-2'),
    variants: [{ skuSuffix: 'standard', label: 'Standard', listPrice: 129, countInStock: 15 }]
  },
  {
    name: 'AirPods (3rd generation)',
    modelKey: 'airpods-3',
    brand: 'Apple',
    category: 'Electronics',
    subcategory: 'Audio',
    pricingCategory: 'Wearables',
    releaseYear: 2021,
    description: 'Spatial audio AirPods with sweat resistance.',
    image: catalogImage(apple, 'airpods-3'),
    variants: [
      { skuSuffix: 'standard', label: 'Standard', listPrice: 169, countInStock: 12 },
      { skuSuffix: 'magsafe', label: 'MagSafe Case', listPrice: 179, countInStock: 10 }
    ]
  },
  {
    name: 'AirPods Pro (1st generation)',
    modelKey: 'airpods-pro-1',
    brand: 'Apple',
    category: 'Electronics',
    subcategory: 'Audio',
    pricingCategory: 'Wearables',
    releaseYear: 2019,
    description: 'Active noise cancellation with interchangeable tips.',
    image: catalogImage(apple, 'airpods-pro-1'),
    variants: [{ skuSuffix: 'standard', label: 'Standard', listPrice: 249, countInStock: 14 }]
  },
  {
    name: 'AirPods Pro (2nd generation)',
    modelKey: 'airpods-pro-2',
    brand: 'Apple',
    category: 'Electronics',
    subcategory: 'Audio',
    pricingCategory: 'Wearables',
    releaseYear: 2022,
    description: 'H2 chip with improved ANC and case speaker.',
    image: catalogImage(apple, 'airpods-pro-2'),
    variants: [
      { skuSuffix: 'usbc', label: 'USB-C Case', listPrice: 249, countInStock: 18 },
      { skuSuffix: 'lightning', label: 'Lightning Case', listPrice: 249, countInStock: 8 }
    ]
  },
  {
    name: 'AirPods 4',
    modelKey: 'airpods-4',
    brand: 'Apple',
    category: 'Electronics',
    subcategory: 'Audio',
    pricingCategory: 'Wearables',
    releaseYear: 2024,
    description: 'Open-ear AirPods 4 with H2 audio.',
    image: catalogImage(apple, 'airpods-4'),
    variants: [
      { skuSuffix: 'standard', label: 'Standard', listPrice: 129, countInStock: 16 },
      { skuSuffix: 'anc', label: 'With ANC', listPrice: 179, countInStock: 12 }
    ]
  },
  {
    name: 'AirPods Max',
    modelKey: 'airpods-max',
    brand: 'Apple',
    category: 'Electronics',
    subcategory: 'Audio',
    pricingCategory: 'Wearables',
    releaseYear: 2020,
    description: 'Over-ear Apple headphones with computational audio.',
    image: catalogImage(apple, 'airpods-max'),
    variants: [
      { skuSuffix: 'space-gray', label: 'Space Gray', listPrice: 549, countInStock: 6 },
      { skuSuffix: 'silver', label: 'Silver', listPrice: 549, countInStock: 5 },
      { skuSuffix: 'midnight', label: 'Midnight', listPrice: 549, countInStock: 7 }
    ]
  }
];
