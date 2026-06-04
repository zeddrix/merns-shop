import type { CatalogParentDraft } from '../types.js';
import { catalogImage } from '../helpers.js';

const brand = 'samsung';

export const samsungWatches: CatalogParentDraft[] = [
  {
    name: 'Galaxy Watch3',
    modelKey: 'galaxy-watch3',
    brand: 'Samsung',
    category: 'Electronics',
    subcategory: 'Wearables',
    pricingCategory: 'Wearables',
    releaseYear: 2020,
    description: 'Rotating bezel smartwatch with ECG.',
    image: catalogImage(brand, 'galaxy-watch3'),
    variants: [
      { skuSuffix: '41mm-bt', label: '41mm Bluetooth', listPrice: 399, countInStock: 7 },
      { skuSuffix: '45mm-lte', label: '45mm LTE', listPrice: 449, countInStock: 5 }
    ]
  },
  {
    name: 'Galaxy Watch4',
    modelKey: 'galaxy-watch4',
    brand: 'Samsung',
    category: 'Electronics',
    subcategory: 'Wearables',
    pricingCategory: 'Wearables',
    releaseYear: 2021,
    description: 'Wear OS Galaxy Watch4.',
    image: catalogImage(brand, 'galaxy-watch4'),
    variants: [
      { skuSuffix: '40mm-bt', label: '40mm Bluetooth', listPrice: 249, countInStock: 10 },
      { skuSuffix: '44mm-bt', label: '44mm Bluetooth', listPrice: 279, countInStock: 9 }
    ]
  },
  {
    name: 'Galaxy Watch5 Pro',
    modelKey: 'galaxy-watch5-pro',
    brand: 'Samsung',
    category: 'Electronics',
    subcategory: 'Wearables',
    pricingCategory: 'Wearables',
    releaseYear: 2022,
    description: 'Rugged sapphire Galaxy Watch.',
    image: catalogImage(brand, 'galaxy-watch5-pro'),
    variants: [{ skuSuffix: '45mm-lte', label: '45mm LTE', listPrice: 449, countInStock: 8 }]
  },
  {
    name: 'Galaxy Watch6',
    modelKey: 'galaxy-watch6',
    brand: 'Samsung',
    category: 'Electronics',
    subcategory: 'Wearables',
    pricingCategory: 'Wearables',
    releaseYear: 2023,
    description: 'Slimmer bezel Watch6.',
    image: catalogImage(brand, 'galaxy-watch6'),
    variants: [
      { skuSuffix: '40mm-bt', label: '40mm Bluetooth', listPrice: 299, countInStock: 11 },
      { skuSuffix: '44mm-bt', label: '44mm Bluetooth', listPrice: 329, countInStock: 10 }
    ]
  },
  {
    name: 'Galaxy Watch7',
    modelKey: 'galaxy-watch7',
    brand: 'Samsung',
    category: 'Electronics',
    subcategory: 'Wearables',
    pricingCategory: 'Wearables',
    releaseYear: 2024,
    description: 'BioActive sensor Watch7.',
    image: catalogImage(brand, 'galaxy-watch7'),
    variants: [
      { skuSuffix: '40mm-bt', label: '40mm Bluetooth', listPrice: 299, countInStock: 12 },
      { skuSuffix: '44mm-lte', label: '44mm LTE', listPrice: 349, countInStock: 9 }
    ]
  },
  {
    name: 'Galaxy Watch Ultra',
    modelKey: 'galaxy-watch-ultra',
    brand: 'Samsung',
    category: 'Electronics',
    subcategory: 'Wearables',
    pricingCategory: 'Wearables',
    releaseYear: 2024,
    description: 'Endurance-focused Galaxy Watch Ultra.',
    image: catalogImage(brand, 'galaxy-watch-ultra'),
    variants: [{ skuSuffix: '47mm-lte', label: '47mm LTE', listPrice: 649, countInStock: 6 }]
  }
];
