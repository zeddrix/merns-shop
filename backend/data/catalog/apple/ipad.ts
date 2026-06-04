import type { CatalogParentDraft } from '../types.js';
import { catalogImage, storageVariants, defaultReviews } from '../helpers.js';

const apple = 'apple';

const ipads: CatalogParentDraft[] = [
  {
    name: 'iPad (9th generation)',
    modelKey: 'ipad-9',
    brand: 'Apple',
    category: 'Electronics',
    subcategory: 'Tablets',
    pricingCategory: 'Tablets',
    releaseYear: 2021,
    description: 'A13 iPad with Home button and Lightning.',
    image: catalogImage(apple, 'ipad-9'),
    variants: storageVariants('ipad-9', [
      { gb: 64, listPrice: 329 },
      { gb: 256, listPrice: 479 }
    ])
  },
  {
    name: 'iPad (10th generation)',
    modelKey: 'ipad-10',
    brand: 'Apple',
    category: 'Electronics',
    subcategory: 'Tablets',
    pricingCategory: 'Tablets',
    releaseYear: 2022,
    description: 'Colorful iPad with USB-C and landscape camera.',
    image: catalogImage(apple, 'ipad-10'),
    variants: storageVariants('ipad-10', [
      { gb: 64, listPrice: 449 },
      { gb: 256, listPrice: 599 }
    ])
  },
  {
    name: 'iPad Air (4th generation)',
    modelKey: 'ipad-air-4',
    brand: 'Apple',
    category: 'Electronics',
    subcategory: 'Tablets',
    pricingCategory: 'Tablets',
    releaseYear: 2020,
    description: 'A14 iPad Air with Touch ID in power button.',
    image: catalogImage(apple, 'ipad-air-4'),
    variants: storageVariants('ipad-air-4', [
      { gb: 64, listPrice: 599 },
      { gb: 256, listPrice: 749 }
    ])
  },
  {
    name: 'iPad Air (5th generation)',
    modelKey: 'ipad-air-5',
    brand: 'Apple',
    category: 'Electronics',
    subcategory: 'Tablets',
    pricingCategory: 'Tablets',
    releaseYear: 2022,
    description: 'M1-powered iPad Air with 5G option.',
    image: catalogImage(apple, 'ipad-air-5'),
    variants: storageVariants('ipad-air-5', [
      { gb: 64, listPrice: 599 },
      { gb: 256, listPrice: 749 }
    ])
  },
  {
    name: 'iPad Air (M2)',
    modelKey: 'ipad-air-m2',
    brand: 'Apple',
    category: 'Electronics',
    subcategory: 'Tablets',
    pricingCategory: 'Tablets',
    releaseYear: 2024,
    description: 'M2 iPad Air in 11" and 13" sizes.',
    image: catalogImage(apple, 'ipad-air-m2'),
    variants: storageVariants('ipad-air-m2', [
      { gb: 128, listPrice: 599 },
      { gb: 256, listPrice: 749 },
      { gb: 512, listPrice: 949 }
    ])
  },
  {
    name: 'iPad mini (6th generation)',
    modelKey: 'ipad-mini-6',
    brand: 'Apple',
    category: 'Electronics',
    subcategory: 'Tablets',
    pricingCategory: 'Tablets',
    releaseYear: 2021,
    description: 'Compact A15 iPad mini with USB-C.',
    image: catalogImage(apple, 'ipad-mini-6'),
    variants: storageVariants('ipad-mini-6', [
      { gb: 64, listPrice: 499 },
      { gb: 256, listPrice: 649 }
    ])
  },
  {
    name: 'iPad mini (A17 Pro)',
    modelKey: 'ipad-mini-a17',
    brand: 'Apple',
    category: 'Electronics',
    subcategory: 'Tablets',
    pricingCategory: 'Tablets',
    releaseYear: 2024,
    description: 'Powerful small iPad with Apple Pencil Pro support.',
    image: catalogImage(apple, 'ipad-mini-a17'),
    variants: storageVariants('ipad-mini-a17', [
      { gb: 128, listPrice: 499 },
      { gb: 256, listPrice: 649 },
      { gb: 512, listPrice: 849 }
    ])
  },
  {
    name: 'iPad Pro 11" (3rd generation)',
    modelKey: 'ipad-pro-11-m1',
    brand: 'Apple',
    category: 'Electronics',
    subcategory: 'Tablets',
    pricingCategory: 'Tablets',
    releaseYear: 2021,
    description: 'M1 iPad Pro 11-inch with ProMotion.',
    image: catalogImage(apple, 'ipad-pro-11-m1'),
    variants: storageVariants('ipad-pro-11-m1', [
      { gb: 128, listPrice: 799 },
      { gb: 256, listPrice: 899 },
      { gb: 512, listPrice: 1099 },
      { gb: 1024, listPrice: 1499 }
    ])
  },
  {
    name: 'iPad Pro 12.9" (5th generation)',
    modelKey: 'ipad-pro-129-m1',
    brand: 'Apple',
    category: 'Electronics',
    subcategory: 'Tablets',
    pricingCategory: 'Tablets',
    releaseYear: 2021,
    description: 'Large M1 iPad Pro with mini-LED display.',
    image: catalogImage(apple, 'ipad-pro-129-m1'),
    variants: storageVariants('ipad-pro-129-m1', [
      { gb: 128, listPrice: 1099 },
      { gb: 256, listPrice: 1199 },
      { gb: 512, listPrice: 1399 },
      { gb: 1024, listPrice: 1799 }
    ])
  },
  {
    name: 'iPad Pro 11" (M4)',
    modelKey: 'ipad-pro-11-m4',
    brand: 'Apple',
    category: 'Electronics',
    subcategory: 'Tablets',
    pricingCategory: 'Tablets',
    releaseYear: 2024,
    description: 'Thin M4 iPad Pro with tandem OLED.',
    image: catalogImage(apple, 'ipad-pro-11-m4'),
    variants: storageVariants('ipad-pro-11-m4', [
      { gb: 256, listPrice: 999 },
      { gb: 512, listPrice: 1199 },
      { gb: 1024, listPrice: 1499 }
    ])
  },
  {
    name: 'iPad Pro 13" (M4)',
    modelKey: 'ipad-pro-13-m4',
    brand: 'Apple',
    category: 'Electronics',
    subcategory: 'Tablets',
    pricingCategory: 'Tablets',
    releaseYear: 2024,
    description: 'Largest iPad Pro with M4 chip.',
    image: catalogImage(apple, 'ipad-pro-13-m4'),
    variants: storageVariants('ipad-pro-13-m4', [
      { gb: 256, listPrice: 1299 },
      { gb: 512, listPrice: 1499 },
      { gb: 1024, listPrice: 1799 }
    ])
  },
  {
    name: 'iPad (A16)',
    modelKey: 'ipad-a16',
    brand: 'Apple',
    category: 'Electronics',
    subcategory: 'Tablets',
    pricingCategory: 'Tablets',
    releaseYear: 2025,
    description: 'Entry iPad with A16 and Apple Pencil support.',
    image: catalogImage(apple, 'ipad-a16'),
    variants: storageVariants('ipad-a16', [
      { gb: 128, listPrice: 349 },
      { gb: 256, listPrice: 499 }
    ])
  }
];

ipads.forEach((p, i) => {
  const reviews = defaultReviews(p.releaseYear);
  p.rating = reviews.rating;
  p.numReviews = reviews.numReviews + i;
});

export const appleIpads = ipads;
