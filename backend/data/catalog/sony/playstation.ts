import type { CatalogParentDraft } from '../types.js';
import { catalogImage, consoleStorageVariants } from '../helpers.js';

const brand = 'sony';

export const sonyPlaystations: CatalogParentDraft[] = [
  {
    name: 'PlayStation 4 Slim',
    modelKey: 'ps4-slim',
    brand: 'Sony',
    category: 'Electronics',
    subcategory: 'Consoles',
    pricingCategory: 'Consoles',
    releaseYear: 2016,
    description: 'Compact PS4 for classic PlayStation library.',
    image: catalogImage(brand, 'ps4-slim'),
    variants: consoleStorageVariants([
      { label: '500GB', suffix: '500gb', listPrice: 299 },
      { label: '1TB', suffix: '1tb', listPrice: 349 }
    ])
  },
  {
    name: 'PlayStation 4 Pro',
    modelKey: 'ps4-pro',
    brand: 'Sony',
    category: 'Electronics',
    subcategory: 'Consoles',
    pricingCategory: 'Consoles',
    releaseYear: 2016,
    description: '4K-enhanced PS4 Pro console.',
    image: catalogImage(brand, 'ps4-pro'),
    variants: consoleStorageVariants([{ label: '1TB', suffix: '1tb', listPrice: 399 }])
  },
  {
    name: 'PlayStation 5',
    modelKey: 'ps5',
    brand: 'Sony',
    category: 'Electronics',
    subcategory: 'Consoles',
    pricingCategory: 'Consoles',
    releaseYear: 2020,
    description: 'Ultra-high speed SSD PS5.',
    image: catalogImage(brand, 'ps5'),
    variants: consoleStorageVariants([
      { label: '825GB Digital', suffix: 'digital', listPrice: 399 },
      { label: '825GB Disc', suffix: 'disc', listPrice: 499 }
    ])
  },
  {
    name: 'PlayStation 5 Slim',
    modelKey: 'ps5-slim',
    brand: 'Sony',
    category: 'Electronics',
    subcategory: 'Consoles',
    pricingCategory: 'Consoles',
    releaseYear: 2023,
    description: 'Slimmer PS5 with 1TB storage.',
    image: catalogImage(brand, 'ps5-slim'),
    variants: consoleStorageVariants([
      { label: '1TB Digital', suffix: 'digital-1tb', listPrice: 449 },
      { label: '1TB Disc', suffix: 'disc-1tb', listPrice: 499 }
    ])
  },
  {
    name: 'PlayStation 5 Pro',
    modelKey: 'ps5-pro',
    brand: 'Sony',
    category: 'Electronics',
    subcategory: 'Consoles',
    pricingCategory: 'Consoles',
    releaseYear: 2024,
    description: 'Enhanced ray tracing PS5 Pro.',
    image: catalogImage(brand, 'ps5-pro'),
    variants: consoleStorageVariants([{ label: '2TB', suffix: '2tb', listPrice: 699 }])
  }
];
