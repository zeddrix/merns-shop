import type { CatalogParentDraft } from './types.js';
import { catalogImage, phoneParent, storageVariants, screenVariants } from './helpers.js';

const samsung = 'samsung';
const sony = 'sony';
const apple = 'apple';

const extraPhones = [
  {
    brand: 'Samsung',
    key: 'galaxy-note-20',
    name: 'Galaxy Note 20',
    year: 2020,
    slug: 'galaxy-note-20',
    tiers: [
      { gb: 128, listPrice: 999 },
      { gb: 256, listPrice: 1049 }
    ]
  },
  {
    brand: 'Samsung',
    key: 'galaxy-note-20-ultra',
    name: 'Galaxy Note 20 Ultra',
    year: 2020,
    slug: 'galaxy-note-20-ultra',
    tiers: [
      { gb: 128, listPrice: 1299 },
      { gb: 512, listPrice: 1499 }
    ]
  },
  {
    brand: 'Samsung',
    key: 'galaxy-s10',
    name: 'Galaxy S10',
    year: 2019,
    slug: 'galaxy-s10',
    tiers: [
      { gb: 128, listPrice: 899 },
      { gb: 512, listPrice: 1099 }
    ]
  },
  {
    brand: 'Samsung',
    key: 'galaxy-s10-plus',
    name: 'Galaxy S10+',
    year: 2019,
    slug: 'galaxy-s10-plus',
    tiers: [
      { gb: 128, listPrice: 999 },
      { gb: 512, listPrice: 1199 }
    ]
  },
  {
    brand: 'Vivo',
    key: 'vivo-x51',
    name: 'vivo X51 5G',
    year: 2020,
    slug: 'vivo-x51',
    tiers: [{ gb: 256, listPrice: 749 }]
  },
  {
    brand: 'Vivo',
    key: 'vivo-x30-pro',
    name: 'vivo X30 Pro',
    year: 2020,
    slug: 'vivo-x30-pro',
    tiers: [{ gb: 256, listPrice: 699 }]
  },
  {
    brand: 'Vivo',
    key: 'vivo-s1-pro',
    name: 'vivo S1 Pro',
    year: 2020,
    slug: 'vivo-s1-pro',
    tiers: [{ gb: 128, listPrice: 399 }]
  },
  {
    brand: 'Xiaomi',
    key: 'mi-9',
    name: 'Mi 9',
    year: 2019,
    slug: 'mi-9',
    tiers: [
      { gb: 128, listPrice: 649 },
      { gb: 256, listPrice: 699 }
    ]
  },
  {
    brand: 'Xiaomi',
    key: 'redmi-note-8-pro',
    name: 'Redmi Note 8 Pro',
    year: 2019,
    slug: 'redmi-note-8-pro',
    tiers: [
      { gb: 64, listPrice: 249 },
      { gb: 128, listPrice: 279 }
    ]
  },
  {
    brand: 'Xiaomi',
    key: 'redmi-10',
    name: 'Redmi 10',
    year: 2021,
    slug: 'redmi-10',
    tiers: [
      { gb: 64, listPrice: 199 },
      { gb: 128, listPrice: 229 }
    ]
  },
  {
    brand: 'Xiaomi',
    key: 'redmi-12',
    name: 'Redmi 12',
    year: 2023,
    slug: 'redmi-12',
    tiers: [
      { gb: 128, listPrice: 199 },
      { gb: 256, listPrice: 229 }
    ]
  },
  {
    brand: 'Xiaomi',
    key: 'redmi-13',
    name: 'Redmi 13',
    year: 2024,
    slug: 'redmi-13',
    tiers: [
      { gb: 128, listPrice: 229 },
      { gb: 256, listPrice: 259 }
    ]
  },
  {
    brand: 'Apple',
    key: 'iphone-se-2',
    name: 'iPhone SE (2nd generation)',
    year: 2020,
    slug: 'iphone-se-2',
    tiers: [
      { gb: 64, listPrice: 399 },
      { gb: 128, listPrice: 449 },
      { gb: 256, listPrice: 549 }
    ]
  },
  {
    brand: 'Apple',
    key: 'iphone-se-3',
    name: 'iPhone SE (3rd generation)',
    year: 2022,
    slug: 'iphone-se-3',
    tiers: [
      { gb: 64, listPrice: 429 },
      { gb: 128, listPrice: 479 },
      { gb: 256, listPrice: 579 }
    ]
  },
  {
    brand: 'Apple',
    key: 'iphone-xr',
    name: 'iPhone XR',
    year: 2018,
    slug: 'iphone-xr',
    tiers: [
      { gb: 64, listPrice: 749 },
      { gb: 128, listPrice: 799 }
    ]
  }
].map((p) =>
  phoneParent({
    name: p.name,
    modelKey: p.key,
    brand: p.brand,
    releaseYear: p.year,
    description: `${p.name} — pre-owned value pricing.`,
    image: catalogImage(p.brand.toLowerCase() === 'apple' ? apple : p.brand.toLowerCase(), p.slug),
    storageTiers: p.tiers
  })
);

const extraTvs: CatalogParentDraft[] = [
  {
    name: 'Samsung CU7000 Crystal UHD',
    modelKey: 'samsung-cu7000',
    brand: 'Samsung',
    category: 'Electronics',
    subcategory: 'TVs',
    pricingCategory: 'TVs',
    releaseYear: 2023,
    description: 'Budget 4K Crystal UHD TV.',
    image: catalogImage(samsung, 'samsung-cu7000'),
    variants: screenVariants([
      { inches: 43, listPrice: 399 },
      { inches: 50, listPrice: 449 },
      { inches: 55, listPrice: 499 },
      { inches: 65, listPrice: 649 }
    ])
  },
  {
    name: 'Sony X85K LED TV',
    modelKey: 'sony-x85k',
    brand: 'Sony',
    category: 'Electronics',
    subcategory: 'TVs',
    pricingCategory: 'TVs',
    releaseYear: 2022,
    description: '4K HDR LED with Google TV.',
    image: catalogImage(sony, 'sony-x85k'),
    variants: screenVariants([
      { inches: 55, listPrice: 899 },
      { inches: 65, listPrice: 1199 },
      { inches: 75, listPrice: 1699 }
    ])
  }
];

const extraAudio: CatalogParentDraft[] = [
  {
    name: 'Samsung Galaxy Buds2',
    modelKey: 'galaxy-buds2',
    brand: 'Samsung',
    category: 'Electronics',
    subcategory: 'Audio',
    pricingCategory: 'Audio',
    releaseYear: 2021,
    description: 'Compact ANC Galaxy Buds.',
    image: catalogImage(samsung, 'galaxy-buds2'),
    variants: [
      { skuSuffix: 'standard', label: 'Standard', listPrice: 149, countInStock: 12 },
      { skuSuffix: 'pro', label: 'Graphite', listPrice: 199, countInStock: 10 }
    ]
  },
  {
    name: 'Samsung Galaxy Buds2 Pro',
    modelKey: 'galaxy-buds2-pro',
    brand: 'Samsung',
    category: 'Electronics',
    subcategory: 'Audio',
    pricingCategory: 'Audio',
    releaseYear: 2022,
    description: 'Hi-fi 24-bit Galaxy Buds Pro.',
    image: catalogImage(samsung, 'galaxy-buds2-pro'),
    variants: [
      { skuSuffix: 'graphite', label: 'Graphite', listPrice: 229, countInStock: 11 },
      { skuSuffix: 'white', label: 'White', listPrice: 229, countInStock: 9 }
    ]
  },
  {
    name: 'Sony WF-C500',
    modelKey: 'sony-wf-c500',
    brand: 'Sony',
    category: 'Electronics',
    subcategory: 'Audio',
    pricingCategory: 'Audio',
    releaseYear: 2021,
    description: 'Lightweight Sony wireless earbuds.',
    image: catalogImage(sony, 'sony-wf-c500'),
    variants: [{ skuSuffix: 'standard', label: 'Standard', listPrice: 99, countInStock: 18 }]
  }
];

const extraMacVariants: CatalogParentDraft[] = [
  {
    name: 'MacBook Pro 14" (M4 Pro)',
    modelKey: 'macbook-pro-14-m4-pro',
    brand: 'Apple',
    category: 'Electronics',
    subcategory: 'Laptops',
    pricingCategory: 'Laptops',
    releaseYear: 2024,
    description: 'M4 Pro MacBook Pro for pros.',
    image: catalogImage(apple, 'macbook-pro-14-m4-pro'),
    variants: storageVariants('macbook-pro-14-m4-pro', [
      { gb: 512, listPrice: 1999 },
      { gb: 1024, listPrice: 2499 },
      { gb: 2048, listPrice: 2999 }
    ])
  },
  {
    name: 'MacBook Pro 16" (M4 Max)',
    modelKey: 'macbook-pro-16-m4-max',
    brand: 'Apple',
    category: 'Electronics',
    subcategory: 'Laptops',
    pricingCategory: 'Laptops',
    releaseYear: 2024,
    description: 'Largest M4 Max MacBook Pro.',
    image: catalogImage(apple, 'macbook-pro-16-m4-max'),
    variants: storageVariants('macbook-pro-16-m4-max', [
      { gb: 1024, listPrice: 3499 },
      { gb: 2048, listPrice: 3999 }
    ])
  }
];

const bulkMidRange: CatalogParentDraft[] = [
  'Galaxy A12',
  'Galaxy A13',
  'Galaxy A14',
  'Galaxy A23',
  'Galaxy A24',
  'Galaxy A25',
  'Galaxy A34',
  'Galaxy A73',
  'vivo Y15',
  'vivo Y16',
  'vivo Y17',
  'vivo Y21',
  'vivo Y27',
  'vivo Y28',
  'vivo Y35',
  'Redmi 9',
  'Redmi 9A',
  'Redmi 9C',
  'Redmi 11 Prime',
  'Redmi 12C',
  'POCO X3',
  'POCO X4 Pro',
  'POCO M4 Pro',
  'Galaxy M32',
  'Galaxy M33',
  'Galaxy M34',
  'Galaxy M54',
  'vivo T1',
  'vivo T2'
].map((name, i) => {
  const slug = name.toLowerCase().replace(/\s+/g, '-');
  const brand = name.startsWith('Galaxy') ? 'Samsung' : name.startsWith('vivo') ? 'Vivo' : 'Xiaomi';
  const folder = brand.toLowerCase();
  return phoneParent({
    name,
    modelKey: slug,
    brand,
    releaseYear: 2020 + (i % 6),
    description: `${name} — reliable mid-range pre-owned phone.`,
    image: catalogImage(folder, slug),
    storageTiers: [
      { gb: 64, listPrice: 199 + i * 5 },
      { gb: 128, listPrice: 249 + i * 5 },
      { gb: 256, listPrice: 299 + i * 5 }
    ]
  });
});

export const catalogExtras: CatalogParentDraft[] = [
  ...extraPhones,
  ...extraTvs,
  ...extraAudio,
  ...extraMacVariants,
  ...bulkMidRange
];
