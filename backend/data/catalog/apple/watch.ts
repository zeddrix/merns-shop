import type { CatalogParentDraft } from '../types.js';
import { catalogImage } from '../helpers.js';

const apple = 'apple';

export const appleWatches: CatalogParentDraft[] = [
  {
    name: 'Apple Watch Series 6',
    modelKey: 'watch-series-6',
    brand: 'Apple',
    category: 'Electronics',
    subcategory: 'Wearables',
    pricingCategory: 'Wearables',
    releaseYear: 2020,
    description: 'Blood oxygen and always-on Retina display.',
    image: catalogImage(apple, 'watch-series-6'),
    variants: [
      { skuSuffix: '40mm-gps', label: '40mm GPS', listPrice: 399, countInStock: 8 },
      { skuSuffix: '44mm-gps', label: '44mm GPS', listPrice: 429, countInStock: 7 }
    ]
  },
  {
    name: 'Apple Watch Series 7',
    modelKey: 'watch-series-7',
    brand: 'Apple',
    category: 'Electronics',
    subcategory: 'Wearables',
    pricingCategory: 'Wearables',
    releaseYear: 2021,
    description: 'Larger durable display with fast charging.',
    image: catalogImage(apple, 'watch-series-7'),
    variants: [
      { skuSuffix: '41mm-gps', label: '41mm GPS', listPrice: 399, countInStock: 9 },
      { skuSuffix: '45mm-gps', label: '45mm GPS', listPrice: 429, countInStock: 8 }
    ]
  },
  {
    name: 'Apple Watch Series 8',
    modelKey: 'watch-series-8',
    brand: 'Apple',
    category: 'Electronics',
    subcategory: 'Wearables',
    pricingCategory: 'Wearables',
    releaseYear: 2022,
    description: 'Temperature sensing and crash detection.',
    image: catalogImage(apple, 'watch-series-8'),
    variants: [
      { skuSuffix: '41mm-gps', label: '41mm GPS', listPrice: 399, countInStock: 10 },
      { skuSuffix: '45mm-gps', label: '45mm GPS', listPrice: 429, countInStock: 9 }
    ]
  },
  {
    name: 'Apple Watch Series 9',
    modelKey: 'watch-series-9',
    brand: 'Apple',
    category: 'Electronics',
    subcategory: 'Wearables',
    pricingCategory: 'Wearables',
    releaseYear: 2023,
    description: 'S9 chip with double tap gesture.',
    image: catalogImage(apple, 'watch-series-9'),
    variants: [
      { skuSuffix: '41mm-gps', label: '41mm GPS', listPrice: 399, countInStock: 11 },
      { skuSuffix: '45mm-gps', label: '45mm GPS', listPrice: 429, countInStock: 10 }
    ]
  },
  {
    name: 'Apple Watch Series 10',
    modelKey: 'watch-series-10',
    brand: 'Apple',
    category: 'Electronics',
    subcategory: 'Wearables',
    pricingCategory: 'Wearables',
    releaseYear: 2024,
    description: 'Thinner Series 10 with sleep apnea detection.',
    image: catalogImage(apple, 'watch-series-10'),
    variants: [
      { skuSuffix: '42mm-gps', label: '42mm GPS', listPrice: 399, countInStock: 12 },
      { skuSuffix: '46mm-gps', label: '46mm GPS', listPrice: 429, countInStock: 11 }
    ]
  },
  {
    name: 'Apple Watch SE (2nd generation)',
    modelKey: 'watch-se-2',
    brand: 'Apple',
    category: 'Electronics',
    subcategory: 'Wearables',
    pricingCategory: 'Wearables',
    releaseYear: 2022,
    description: 'Affordable Apple Watch with core health features.',
    image: catalogImage(apple, 'watch-se-2'),
    variants: [
      { skuSuffix: '40mm-gps', label: '40mm GPS', listPrice: 249, countInStock: 14 },
      { skuSuffix: '44mm-gps', label: '44mm GPS', listPrice: 279, countInStock: 13 }
    ]
  },
  {
    name: 'Apple Watch Ultra',
    modelKey: 'watch-ultra-1',
    brand: 'Apple',
    category: 'Electronics',
    subcategory: 'Wearables',
    pricingCategory: 'Wearables',
    releaseYear: 2022,
    description: 'Rugged 49mm watch for outdoor adventures.',
    image: catalogImage(apple, 'watch-ultra-1'),
    variants: [{ skuSuffix: '49mm-gps', label: '49mm GPS', listPrice: 799, countInStock: 6 }]
  },
  {
    name: 'Apple Watch Ultra 2',
    modelKey: 'watch-ultra-2',
    brand: 'Apple',
    category: 'Electronics',
    subcategory: 'Wearables',
    pricingCategory: 'Wearables',
    releaseYear: 2023,
    description: 'Brightest Apple Watch display with S9 SiP.',
    image: catalogImage(apple, 'watch-ultra-2'),
    variants: [{ skuSuffix: '49mm-gps', label: '49mm GPS', listPrice: 799, countInStock: 8 }]
  }
];
