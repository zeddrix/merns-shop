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
  }
];
