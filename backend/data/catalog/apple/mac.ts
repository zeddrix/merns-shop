import type { CatalogParentDraft } from '../types.js';
import { catalogImage, storageVariants } from '../helpers.js';

const apple = 'apple';

export const appleMacs: CatalogParentDraft[] = [
  {
    name: 'MacBook Air (M1)',
    modelKey: 'macbook-air-m1',
    brand: 'Apple',
    category: 'Electronics',
    subcategory: 'Laptops',
    pricingCategory: 'Laptops',
    releaseYear: 2020,
    description: 'Fanless M1 MacBook Air — silent and efficient.',
    image: catalogImage(apple, 'macbook-air-m1'),
    variants: storageVariants('macbook-air-m1', [
      { gb: 256, listPrice: 999 },
      { gb: 512, listPrice: 1249 }
    ])
  },
  {
    name: 'MacBook Air (M2)',
    modelKey: 'macbook-air-m2',
    brand: 'Apple',
    category: 'Electronics',
    subcategory: 'Laptops',
    pricingCategory: 'Laptops',
    releaseYear: 2022,
    description: 'Redesigned Air with M2 and MagSafe.',
    image: catalogImage(apple, 'macbook-air-m2'),
    variants: storageVariants('macbook-air-m2', [
      { gb: 256, listPrice: 1199 },
      { gb: 512, listPrice: 1499 },
      { gb: 1024, listPrice: 1799 }
    ])
  },
  {
    name: 'MacBook Air 13" (M3)',
    modelKey: 'macbook-air-m3-13',
    brand: 'Apple',
    category: 'Electronics',
    subcategory: 'Laptops',
    pricingCategory: 'Laptops',
    releaseYear: 2024,
    description: 'M3 MacBook Air with improved GPU.',
    image: catalogImage(apple, 'macbook-air-m3-13'),
    variants: storageVariants('macbook-air-m3-13', [
      { gb: 256, listPrice: 1099 },
      { gb: 512, listPrice: 1299 },
      { gb: 1024, listPrice: 1599 }
    ])
  },
  {
    name: 'MacBook Air 15" (M3)',
    modelKey: 'macbook-air-m3-15',
    brand: 'Apple',
    category: 'Electronics',
    subcategory: 'Laptops',
    pricingCategory: 'Laptops',
    releaseYear: 2024,
    description: 'Large-screen MacBook Air with M3.',
    image: catalogImage(apple, 'macbook-air-m3-15'),
    variants: storageVariants('macbook-air-m3-15', [
      { gb: 256, listPrice: 1299 },
      { gb: 512, listPrice: 1499 },
      { gb: 1024, listPrice: 1799 }
    ])
  },
  {
    name: 'MacBook Pro 14" (M1 Pro)',
    modelKey: 'macbook-pro-14-m1-pro',
    brand: 'Apple',
    category: 'Electronics',
    subcategory: 'Laptops',
    pricingCategory: 'Laptops',
    releaseYear: 2021,
    description: 'Pro laptop with M1 Pro and Liquid Retina XDR.',
    image: catalogImage(apple, 'macbook-pro-14-m1-pro'),
    variants: storageVariants('macbook-pro-14-m1-pro', [
      { gb: 512, listPrice: 1999 },
      { gb: 1024, listPrice: 2499 }
    ])
  },
  {
    name: 'MacBook Pro 16" (M1 Pro)',
    modelKey: 'macbook-pro-16-m1-pro',
    brand: 'Apple',
    category: 'Electronics',
    subcategory: 'Laptops',
    pricingCategory: 'Laptops',
    releaseYear: 2021,
    description: 'Large pro MacBook with best M1 Pro battery.',
    image: catalogImage(apple, 'macbook-pro-16-m1-pro'),
    variants: storageVariants('macbook-pro-16-m1-pro', [
      { gb: 512, listPrice: 2499 },
      { gb: 1024, listPrice: 2999 }
    ])
  },
  {
    name: 'MacBook Pro 14" (M3 Pro)',
    modelKey: 'macbook-pro-14-m3-pro',
    brand: 'Apple',
    category: 'Electronics',
    subcategory: 'Laptops',
    pricingCategory: 'Laptops',
    releaseYear: 2023,
    description: 'Space Black option M3 Pro MacBook Pro.',
    image: catalogImage(apple, 'macbook-pro-14-m3-pro'),
    variants: storageVariants('macbook-pro-14-m3-pro', [
      { gb: 512, listPrice: 1999 },
      { gb: 1024, listPrice: 2499 }
    ])
  },
  {
    name: 'MacBook Pro 16" (M3 Max)',
    modelKey: 'macbook-pro-16-m3-max',
    brand: 'Apple',
    category: 'Electronics',
    subcategory: 'Laptops',
    pricingCategory: 'Laptops',
    releaseYear: 2023,
    description: 'Ultimate portable Mac with M3 Max.',
    image: catalogImage(apple, 'macbook-pro-16-m3-max'),
    variants: storageVariants('macbook-pro-16-m3-max', [
      { gb: 1024, listPrice: 3499 },
      { gb: 2048, listPrice: 3999 }
    ])
  },
  {
    name: 'iMac 24" (M1)',
    modelKey: 'imac-m1',
    brand: 'Apple',
    category: 'Electronics',
    subcategory: 'Desktops',
    pricingCategory: 'Laptops',
    releaseYear: 2021,
    description: 'Colorful all-in-one iMac with M1.',
    image: catalogImage(apple, 'imac-m1'),
    variants: storageVariants('imac-m1', [
      { gb: 256, listPrice: 1299 },
      { gb: 512, listPrice: 1499 }
    ])
  },
  {
    name: 'iMac 24" (M4)',
    modelKey: 'imac-m4',
    brand: 'Apple',
    category: 'Electronics',
    subcategory: 'Desktops',
    pricingCategory: 'Laptops',
    releaseYear: 2024,
    description: 'M4 iMac with nano-texture option.',
    image: catalogImage(apple, 'imac-m4'),
    variants: storageVariants('imac-m4', [
      { gb: 256, listPrice: 1299 },
      { gb: 512, listPrice: 1499 }
    ])
  },
  {
    name: 'Mac mini (M1)',
    modelKey: 'mac-mini-m1',
    brand: 'Apple',
    category: 'Electronics',
    subcategory: 'Desktops',
    pricingCategory: 'Laptops',
    releaseYear: 2020,
    description: 'Compact desktop powerhouse with M1.',
    image: catalogImage(apple, 'mac-mini-m1'),
    variants: storageVariants('mac-mini-m1', [
      { gb: 256, listPrice: 699 },
      { gb: 512, listPrice: 899 }
    ])
  },
  {
    name: 'Mac mini (M2 Pro)',
    modelKey: 'mac-mini-m2-pro',
    brand: 'Apple',
    category: 'Electronics',
    subcategory: 'Desktops',
    pricingCategory: 'Laptops',
    releaseYear: 2023,
    description: 'Pro connectivity in a tiny Mac mini.',
    image: catalogImage(apple, 'mac-mini-m2-pro'),
    variants: storageVariants('mac-mini-m2-pro', [
      { gb: 512, listPrice: 1299 },
      { gb: 1024, listPrice: 1699 }
    ])
  },
  {
    name: 'Mac Studio (M2 Max)',
    modelKey: 'mac-studio-m2-max',
    brand: 'Apple',
    category: 'Electronics',
    subcategory: 'Desktops',
    pricingCategory: 'Laptops',
    releaseYear: 2023,
    description: 'Compact studio desktop for creators.',
    image: catalogImage(apple, 'mac-studio-m2-max'),
    variants: storageVariants('mac-studio-m2-max', [
      { gb: 512, listPrice: 1999 },
      { gb: 1024, listPrice: 2499 }
    ])
  },
  {
    name: 'Mac Studio (M2 Ultra)',
    modelKey: 'mac-studio-m2-ultra',
    brand: 'Apple',
    category: 'Electronics',
    subcategory: 'Desktops',
    pricingCategory: 'Laptops',
    releaseYear: 2023,
    description: 'Maximum Mac performance in studio form.',
    image: catalogImage(apple, 'mac-studio-m2-ultra'),
    variants: storageVariants('mac-studio-m2-ultra', [
      { gb: 1024, listPrice: 3999 },
      { gb: 2048, listPrice: 4999 }
    ])
  }
];
