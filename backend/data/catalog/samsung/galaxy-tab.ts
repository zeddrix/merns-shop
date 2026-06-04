import type { CatalogParentDraft } from '../types.js';
import { catalogImage, storageVariants } from '../helpers.js';

const brand = 'samsung';

export const samsungTabs: CatalogParentDraft[] = [
  {
    name: 'Galaxy Tab S7',
    modelKey: 'galaxy-tab-s7',
    brand: 'Samsung',
    category: 'Electronics',
    subcategory: 'Tablets',
    pricingCategory: 'Tablets',
    releaseYear: 2020,
    description: '120Hz Android tablet with S Pen.',
    image: catalogImage(brand, 'galaxy-tab-s7'),
    variants: storageVariants('galaxy-tab-s7', [
      { gb: 128, listPrice: 649 },
      { gb: 256, listPrice: 749 }
    ])
  },
  {
    name: 'Galaxy Tab S8',
    modelKey: 'galaxy-tab-s8',
    brand: 'Samsung',
    category: 'Electronics',
    subcategory: 'Tablets',
    pricingCategory: 'Tablets',
    releaseYear: 2022,
    description: 'Snapdragon 8 Gen 1 Tab S8.',
    image: catalogImage(brand, 'galaxy-tab-s8'),
    variants: storageVariants('galaxy-tab-s8', [
      { gb: 128, listPrice: 699 },
      { gb: 256, listPrice: 759 }
    ])
  },
  {
    name: 'Galaxy Tab S9',
    modelKey: 'galaxy-tab-s9',
    brand: 'Samsung',
    category: 'Electronics',
    subcategory: 'Tablets',
    pricingCategory: 'Tablets',
    releaseYear: 2023,
    description: 'IP68 rated Galaxy Tab S9.',
    image: catalogImage(brand, 'galaxy-tab-s9'),
    variants: storageVariants('galaxy-tab-s9', [
      { gb: 128, listPrice: 799 },
      { gb: 256, listPrice: 859 }
    ])
  },
  {
    name: 'Galaxy Tab S9 Ultra',
    modelKey: 'galaxy-tab-s9-ultra',
    brand: 'Samsung',
    category: 'Electronics',
    subcategory: 'Tablets',
    pricingCategory: 'Tablets',
    releaseYear: 2023,
    description: '14.6" AMOLED mega tablet.',
    image: catalogImage(brand, 'galaxy-tab-s9-ultra'),
    variants: storageVariants('galaxy-tab-s9-ultra', [
      { gb: 256, listPrice: 1199 },
      { gb: 512, listPrice: 1399 }
    ])
  },
  {
    name: 'Galaxy Tab S10+',
    modelKey: 'galaxy-tab-s10-plus',
    brand: 'Samsung',
    category: 'Electronics',
    subcategory: 'Tablets',
    pricingCategory: 'Tablets',
    releaseYear: 2024,
    description: 'Latest Galaxy Tab with AI features.',
    image: catalogImage(brand, 'galaxy-tab-s10-plus'),
    variants: storageVariants('galaxy-tab-s10-plus', [
      { gb: 256, listPrice: 999 },
      { gb: 512, listPrice: 1149 }
    ])
  }
];
