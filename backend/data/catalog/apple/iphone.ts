import type { CatalogParentDraft } from '../types.js';
import { catalogImage, phoneParent } from '../helpers.js';

const apple = 'apple';

const iphoneModels: Array<{
  name: string;
  modelKey: string;
  year: number;
  desc: string;
  slug: string;
  tiers: Array<{ gb: number; listPrice: number }>;
}> = [
  {
    name: 'iPhone 11',
    modelKey: 'iphone-11',
    year: 2019,
    slug: 'iphone-11',
    desc: 'Dual-camera iPhone with A13 Bionic. Great value pre-owned.',
    tiers: [
      { gb: 64, listPrice: 699 },
      { gb: 128, listPrice: 749 },
      { gb: 256, listPrice: 849 }
    ]
  },
  {
    name: 'iPhone 11 Pro',
    modelKey: 'iphone-11-pro',
    year: 2019,
    slug: 'iphone-11-pro',
    desc: 'Pro triple-camera system and OLED display.',
    tiers: [
      { gb: 64, listPrice: 999 },
      { gb: 256, listPrice: 1149 },
      { gb: 512, listPrice: 1349 }
    ]
  },
  {
    name: 'iPhone 11 Pro Max',
    modelKey: 'iphone-11-pro-max',
    year: 2019,
    slug: 'iphone-11-pro-max',
    desc: 'Largest iPhone 11 generation with Pro cameras.',
    tiers: [
      { gb: 64, listPrice: 1099 },
      { gb: 256, listPrice: 1249 },
      { gb: 512, listPrice: 1449 }
    ]
  },
  {
    name: 'iPhone 12 mini',
    modelKey: 'iphone-12-mini',
    year: 2020,
    slug: 'iphone-12-mini',
    desc: 'Compact 5G iPhone with A14 Bionic.',
    tiers: [
      { gb: 64, listPrice: 699 },
      { gb: 128, listPrice: 749 },
      { gb: 256, listPrice: 849 }
    ]
  },
  {
    name: 'iPhone 12',
    modelKey: 'iphone-12',
    year: 2020,
    slug: 'iphone-12',
    desc: '5G iPhone with Ceramic Shield and dual cameras.',
    tiers: [
      { gb: 64, listPrice: 799 },
      { gb: 128, listPrice: 849 },
      { gb: 256, listPrice: 949 }
    ]
  },
  {
    name: 'iPhone 12 Pro',
    modelKey: 'iphone-12-pro',
    year: 2020,
    slug: 'iphone-12-pro',
    desc: 'ProRAW photography and LiDAR scanner.',
    tiers: [
      { gb: 128, listPrice: 999 },
      { gb: 256, listPrice: 1099 },
      { gb: 512, listPrice: 1299 }
    ]
  },
  {
    name: 'iPhone 12 Pro Max',
    modelKey: 'iphone-12-pro-max',
    year: 2020,
    slug: 'iphone-12-pro-max',
    desc: 'Largest 12 series with sensor-shift stabilization.',
    tiers: [
      { gb: 128, listPrice: 1099 },
      { gb: 256, listPrice: 1199 },
      { gb: 512, listPrice: 1399 }
    ]
  },
  {
    name: 'iPhone 13 mini',
    modelKey: 'iphone-13-mini',
    year: 2021,
    slug: 'iphone-13-mini',
    desc: 'A15 Bionic in a pocketable 5G design.',
    tiers: [
      { gb: 128, listPrice: 699 },
      { gb: 256, listPrice: 799 },
      { gb: 512, listPrice: 999 }
    ]
  },
  {
    name: 'iPhone 13',
    modelKey: 'iphone-13',
    year: 2021,
    slug: 'iphone-13',
    desc: 'Improved battery life and cinematic mode video.',
    tiers: [
      { gb: 128, listPrice: 799 },
      { gb: 256, listPrice: 899 },
      { gb: 512, listPrice: 1099 }
    ]
  },
  {
    name: 'iPhone 13 Pro',
    modelKey: 'iphone-13-pro',
    year: 2021,
    slug: 'iphone-13-pro',
    desc: 'ProMotion 120Hz display and macro photography.',
    tiers: [
      { gb: 128, listPrice: 999 },
      { gb: 256, listPrice: 1099 },
      { gb: 512, listPrice: 1299 },
      { gb: 1024, listPrice: 1499 }
    ]
  },
  {
    name: 'iPhone 13 Pro Max',
    modelKey: 'iphone-13-pro-max',
    year: 2021,
    slug: 'iphone-13-pro-max',
    desc: 'Longest battery in iPhone 13 lineup.',
    tiers: [
      { gb: 128, listPrice: 1099 },
      { gb: 256, listPrice: 1199 },
      { gb: 512, listPrice: 1399 },
      { gb: 1024, listPrice: 1599 }
    ]
  },
  {
    name: 'iPhone 14',
    modelKey: 'iphone-14',
    year: 2022,
    slug: 'iphone-14',
    desc: 'Crash Detection and improved cameras.',
    tiers: [
      { gb: 128, listPrice: 799 },
      { gb: 256, listPrice: 899 },
      { gb: 512, listPrice: 1099 }
    ]
  },
  {
    name: 'iPhone 14 Plus',
    modelKey: 'iphone-14-plus',
    year: 2022,
    slug: 'iphone-14-plus',
    desc: 'Large display iPhone 14 with all-day battery.',
    tiers: [
      { gb: 128, listPrice: 899 },
      { gb: 256, listPrice: 999 },
      { gb: 512, listPrice: 1199 }
    ]
  },
  {
    name: 'iPhone 14 Pro',
    modelKey: 'iphone-14-pro',
    year: 2022,
    slug: 'iphone-14-pro',
    desc: 'Dynamic Island and 48MP main camera.',
    tiers: [
      { gb: 128, listPrice: 999 },
      { gb: 256, listPrice: 1099 },
      { gb: 512, listPrice: 1299 },
      { gb: 1024, listPrice: 1499 }
    ]
  },
  {
    name: 'iPhone 14 Pro Max',
    modelKey: 'iphone-14-pro-max',
    year: 2022,
    slug: 'iphone-14-pro-max',
    desc: 'Flagship 14 series with largest Pro display.',
    tiers: [
      { gb: 128, listPrice: 1099 },
      { gb: 256, listPrice: 1199 },
      { gb: 512, listPrice: 1399 },
      { gb: 1024, listPrice: 1599 }
    ]
  },
  {
    name: 'iPhone 15',
    modelKey: 'iphone-15',
    year: 2023,
    slug: 'iphone-15',
    desc: 'USB-C iPhone with 48MP camera and Dynamic Island.',
    tiers: [
      { gb: 128, listPrice: 799 },
      { gb: 256, listPrice: 899 },
      { gb: 512, listPrice: 1099 }
    ]
  },
  {
    name: 'iPhone 15 Plus',
    modelKey: 'iphone-15-plus',
    year: 2023,
    slug: 'iphone-15-plus',
    desc: 'Large USB-C iPhone with extended battery.',
    tiers: [
      { gb: 128, listPrice: 899 },
      { gb: 256, listPrice: 999 },
      { gb: 512, listPrice: 1199 }
    ]
  },
  {
    name: 'iPhone 15 Pro',
    modelKey: 'iphone-15-pro',
    year: 2023,
    slug: 'iphone-15-pro',
    desc: 'Titanium design, A17 Pro, and Action button.',
    tiers: [
      { gb: 128, listPrice: 999 },
      { gb: 256, listPrice: 1099 },
      { gb: 512, listPrice: 1299 },
      { gb: 1024, listPrice: 1499 }
    ]
  },
  {
    name: 'iPhone 15 Pro Max',
    modelKey: 'iphone-15-pro-max',
    year: 2023,
    slug: 'iphone-15-pro-max',
    desc: 'Top-tier 15 series with 5x optical zoom.',
    tiers: [
      { gb: 256, listPrice: 1199 },
      { gb: 512, listPrice: 1399 },
      { gb: 1024, listPrice: 1599 }
    ]
  },
  {
    name: 'iPhone 16',
    modelKey: 'iphone-16',
    year: 2024,
    slug: 'iphone-16',
    desc: 'A18 chip, Camera Control, and Apple Intelligence ready.',
    tiers: [
      { gb: 128, listPrice: 799 },
      { gb: 256, listPrice: 899 },
      { gb: 512, listPrice: 1099 }
    ]
  },
  {
    name: 'iPhone 16 Plus',
    modelKey: 'iphone-16-plus',
    year: 2024,
    slug: 'iphone-16-plus',
    desc: 'Large iPhone 16 with improved battery.',
    tiers: [
      { gb: 128, listPrice: 899 },
      { gb: 256, listPrice: 999 },
      { gb: 512, listPrice: 1199 }
    ]
  },
  {
    name: 'iPhone 16 Pro',
    modelKey: 'iphone-16-pro',
    year: 2024,
    slug: 'iphone-16-pro',
    desc: 'A18 Pro with larger display and advanced video.',
    tiers: [
      { gb: 128, listPrice: 999 },
      { gb: 256, listPrice: 1099 },
      { gb: 512, listPrice: 1299 },
      { gb: 1024, listPrice: 1499 }
    ]
  },
  {
    name: 'iPhone 16 Pro Max',
    modelKey: 'iphone-16-pro-max',
    year: 2024,
    slug: 'iphone-16-pro-max',
    desc: 'Largest iPhone 16 with best battery and zoom.',
    tiers: [
      { gb: 256, listPrice: 1199 },
      { gb: 512, listPrice: 1399 },
      { gb: 1024, listPrice: 1599 }
    ]
  },
  {
    name: 'iPhone 16e',
    modelKey: 'iphone-16e',
    year: 2025,
    slug: 'iphone-16e',
    desc: 'Affordable A18 iPhone with USB-C.',
    tiers: [
      { gb: 128, listPrice: 599 },
      { gb: 256, listPrice: 699 }
    ]
  },
  {
    name: 'iPhone 17',
    modelKey: 'iphone-17',
    year: 2025,
    slug: 'iphone-17',
    desc: 'Latest standard iPhone with upgraded cameras.',
    tiers: [
      { gb: 256, listPrice: 799 },
      { gb: 512, listPrice: 999 }
    ]
  },
  {
    name: 'iPhone 17 Air',
    modelKey: 'iphone-17-air',
    year: 2025,
    slug: 'iphone-17-air',
    desc: 'Ultra-thin iPhone 17 family member.',
    tiers: [
      { gb: 256, listPrice: 999 },
      { gb: 512, listPrice: 1199 },
      { gb: 1024, listPrice: 1399 }
    ]
  },
  {
    name: 'iPhone 17 Pro',
    modelKey: 'iphone-17-pro',
    year: 2025,
    slug: 'iphone-17-pro',
    desc: 'Pro titanium iPhone with telephoto upgrades.',
    tiers: [
      { gb: 256, listPrice: 1099 },
      { gb: 512, listPrice: 1299 },
      { gb: 1024, listPrice: 1499 }
    ]
  },
  {
    name: 'iPhone 17 Pro Max',
    modelKey: 'iphone-17-pro-max',
    year: 2025,
    slug: 'iphone-17-pro-max',
    desc: 'Top iPhone 17 with largest display and battery.',
    tiers: [
      { gb: 256, listPrice: 1199 },
      { gb: 512, listPrice: 1399 },
      { gb: 1024, listPrice: 1599 },
      { gb: 2048, listPrice: 1999 }
    ]
  }
];

export const appleIphones: CatalogParentDraft[] = iphoneModels.map((m) =>
  phoneParent({
    name: m.name,
    modelKey: m.modelKey,
    brand: 'Apple',
    releaseYear: m.year,
    description: m.desc,
    image: catalogImage(apple, m.slug),
    storageTiers: m.tiers
  })
);
