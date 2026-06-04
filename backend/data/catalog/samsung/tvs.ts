import type { CatalogParentDraft } from '../types.js';
import { catalogImage, screenVariants } from '../helpers.js';

const brand = 'samsung';

export const samsungTvs: CatalogParentDraft[] = [
  {
    name: 'Samsung Q60A QLED TV',
    modelKey: 'samsung-q60a',
    brand: 'Samsung',
    category: 'Electronics',
    subcategory: 'TVs',
    pricingCategory: 'TVs',
    releaseYear: 2021,
    description: 'Entry QLED with Quantum HDR.',
    image: catalogImage(brand, 'samsung-q60a'),
    variants: screenVariants([
      { inches: 55, listPrice: 749 },
      { inches: 65, listPrice: 999 }
    ])
  },
  {
    name: 'Samsung Q80B QLED TV',
    modelKey: 'samsung-q80b',
    brand: 'Samsung',
    category: 'Electronics',
    subcategory: 'TVs',
    pricingCategory: 'TVs',
    releaseYear: 2022,
    description: 'Full Array Local Dimming QLED.',
    image: catalogImage(brand, 'samsung-q80b'),
    variants: screenVariants([
      { inches: 55, listPrice: 1199 },
      { inches: 65, listPrice: 1599 },
      { inches: 75, listPrice: 2299 }
    ])
  },
  {
    name: 'Samsung S90C OLED TV',
    modelKey: 'samsung-s90c',
    brand: 'Samsung',
    category: 'Electronics',
    subcategory: 'TVs',
    pricingCategory: 'TVs',
    releaseYear: 2023,
    description: 'QD-OLED with Gaming Hub.',
    image: catalogImage(brand, 'samsung-s90c'),
    variants: screenVariants([
      { inches: 55, listPrice: 1599 },
      { inches: 65, listPrice: 2299 },
      { inches: 77, listPrice: 3499 }
    ])
  },
  {
    name: 'Samsung S95D OLED TV',
    modelKey: 'samsung-s95d',
    brand: 'Samsung',
    category: 'Electronics',
    subcategory: 'TVs',
    pricingCategory: 'TVs',
    releaseYear: 2024,
    description: 'Glare-free OLED flagship.',
    image: catalogImage(brand, 'samsung-s95d'),
    variants: screenVariants([
      { inches: 55, listPrice: 1999 },
      { inches: 65, listPrice: 2799 },
      { inches: 77, listPrice: 4499 }
    ])
  },
  {
    name: 'Samsung Neo QLED 8K QN900C',
    modelKey: 'samsung-qn900c',
    brand: 'Samsung',
    category: 'Electronics',
    subcategory: 'TVs',
    pricingCategory: 'TVs',
    releaseYear: 2023,
    description: '8K Neo QLED with Infinity Screen.',
    image: catalogImage(brand, 'samsung-qn900c'),
    variants: screenVariants(
      [
        { inches: 65, listPrice: 4999 },
        { inches: 75, listPrice: 6499 }
      ],
      4
    )
  }
];
