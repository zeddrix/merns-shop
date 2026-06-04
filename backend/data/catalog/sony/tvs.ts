import type { CatalogParentDraft } from '../types.js';
import { catalogImage, screenVariants } from '../helpers.js';

const brand = 'sony';

export const sonyTvs: CatalogParentDraft[] = [
  {
    name: 'Sony Bravia X80J',
    modelKey: 'sony-x80j',
    brand: 'Sony',
    category: 'Electronics',
    subcategory: 'TVs',
    pricingCategory: 'TVs',
    releaseYear: 2021,
    description: '4K HDR LED Google TV.',
    image: catalogImage(brand, 'sony-x80j'),
    variants: screenVariants([
      { inches: 55, listPrice: 899 },
      { inches: 65, listPrice: 1199 }
    ])
  },
  {
    name: 'Sony Bravia X90J',
    modelKey: 'sony-x90j',
    brand: 'Sony',
    category: 'Electronics',
    subcategory: 'TVs',
    pricingCategory: 'TVs',
    releaseYear: 2021,
    description: 'Full array dimming Bravia for PS5.',
    image: catalogImage(brand, 'sony-x90j'),
    variants: screenVariants([
      { inches: 55, listPrice: 1199 },
      { inches: 65, listPrice: 1599 },
      { inches: 75, listPrice: 2299 }
    ])
  },
  {
    name: 'Sony Bravia A80J OLED',
    modelKey: 'sony-a80j',
    brand: 'Sony',
    category: 'Electronics',
    subcategory: 'TVs',
    pricingCategory: 'TVs',
    releaseYear: 2021,
    description: 'Acoustic Surface Audio OLED.',
    image: catalogImage(brand, 'sony-a80j'),
    variants: screenVariants([
      { inches: 55, listPrice: 1699 },
      { inches: 65, listPrice: 2299 }
    ])
  },
  {
    name: 'Sony Bravia A95L QD-OLED',
    modelKey: 'sony-a95l',
    brand: 'Sony',
    category: 'Electronics',
    subcategory: 'TVs',
    pricingCategory: 'TVs',
    releaseYear: 2023,
    description: 'QD-OLED with Cognitive Processor XR.',
    image: catalogImage(brand, 'sony-a95l'),
    variants: screenVariants(
      [
        { inches: 55, listPrice: 2499 },
        { inches: 65, listPrice: 3499 },
        { inches: 77, listPrice: 4999 }
      ],
      4
    )
  },
  {
    name: 'Sony Bravia XR8 Mini LED',
    modelKey: 'sony-xr8',
    brand: 'Sony',
    category: 'Electronics',
    subcategory: 'TVs',
    pricingCategory: 'TVs',
    releaseYear: 2024,
    description: '2024 Sony mini-LED flagship.',
    image: catalogImage(brand, 'sony-xr8'),
    variants: screenVariants(
      [
        { inches: 65, listPrice: 2999 },
        { inches: 75, listPrice: 3999 }
      ],
      3
    )
  }
];
