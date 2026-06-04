import type { CatalogParentDraft } from '../types.js';
import { catalogImage, phoneParent } from '../helpers.js';

const brand = 'xiaomi';

const miModels = [
  {
    name: 'Mi 10',
    modelKey: 'mi-10',
    year: 2020,
    slug: 'mi-10',
    desc: '108MP Mi flagship.',
    tiers: [
      { gb: 128, listPrice: 699 },
      { gb: 256, listPrice: 749 }
    ]
  },
  {
    name: 'Mi 10 Pro',
    modelKey: 'mi-10-pro',
    year: 2020,
    slug: 'mi-10-pro',
    desc: 'Pro-grade Mi 10 cameras.',
    tiers: [
      { gb: 256, listPrice: 799 },
      { gb: 512, listPrice: 899 }
    ]
  },
  {
    name: 'Mi 11',
    modelKey: 'mi-11',
    year: 2021,
    slug: 'mi-11',
    desc: 'Snapdragon 888 Mi 11.',
    tiers: [
      { gb: 128, listPrice: 749 },
      { gb: 256, listPrice: 799 }
    ]
  },
  {
    name: 'Mi 12',
    modelKey: 'mi-12',
    year: 2022,
    slug: 'mi-12',
    desc: 'Compact flagship Mi 12.',
    tiers: [
      { gb: 128, listPrice: 749 },
      { gb: 256, listPrice: 799 }
    ]
  },
  {
    name: 'Xiaomi 13',
    modelKey: 'xiaomi-13',
    year: 2023,
    slug: 'xiaomi-13',
    desc: 'Leica camera Xiaomi 13.',
    tiers: [
      { gb: 128, listPrice: 799 },
      { gb: 256, listPrice: 849 }
    ]
  },
  {
    name: 'Xiaomi 14',
    modelKey: 'xiaomi-14',
    year: 2024,
    slug: 'xiaomi-14',
    desc: 'Snapdragon 8 Gen 3 Xiaomi 14.',
    tiers: [
      { gb: 256, listPrice: 799 },
      { gb: 512, listPrice: 899 }
    ]
  },
  {
    name: 'Xiaomi 15',
    modelKey: 'xiaomi-15',
    year: 2025,
    slug: 'xiaomi-15',
    desc: 'Latest Leica Xiaomi flagship.',
    tiers: [
      { gb: 256, listPrice: 849 },
      { gb: 512, listPrice: 949 }
    ]
  },
  {
    name: 'Redmi Note 9 Pro',
    modelKey: 'redmi-note-9-pro',
    year: 2020,
    slug: 'redmi-note-9-pro',
    desc: 'Popular value Redmi Note.',
    tiers: [
      { gb: 64, listPrice: 269 },
      { gb: 128, listPrice: 299 }
    ]
  },
  {
    name: 'Redmi Note 10 Pro',
    modelKey: 'redmi-note-10-pro',
    year: 2021,
    slug: 'redmi-note-10-pro',
    desc: '120Hz AMOLED Redmi.',
    tiers: [{ gb: 128, listPrice: 299 }]
  },
  {
    name: 'Redmi Note 11 Pro',
    modelKey: 'redmi-note-11-pro',
    year: 2022,
    slug: 'redmi-note-11-pro',
    desc: '67W fast charge Note.',
    tiers: [
      { gb: 128, listPrice: 299 },
      { gb: 256, listPrice: 329 }
    ]
  },
  {
    name: 'Redmi Note 12 Pro',
    modelKey: 'redmi-note-12-pro',
    year: 2023,
    slug: 'redmi-note-12-pro',
    desc: 'IMX766 sensor mid-range.',
    tiers: [
      { gb: 128, listPrice: 329 },
      { gb: 256, listPrice: 359 }
    ]
  },
  {
    name: 'Redmi Note 13 Pro',
    modelKey: 'redmi-note-13-pro',
    year: 2024,
    slug: 'redmi-note-13-pro',
    desc: '200MP camera Note 13 Pro.',
    tiers: [{ gb: 256, listPrice: 349 }]
  },
  {
    name: 'POCO F3',
    modelKey: 'poco-f3',
    year: 2021,
    slug: 'poco-f3',
    desc: 'Performance POCO flagship killer.',
    tiers: [
      { gb: 128, listPrice: 349 },
      { gb: 256, listPrice: 399 }
    ]
  },
  {
    name: 'POCO F4',
    modelKey: 'poco-f4',
    year: 2022,
    slug: 'poco-f4',
    desc: '120W charging POCO F4.',
    tiers: [
      { gb: 128, listPrice: 399 },
      { gb: 256, listPrice: 449 }
    ]
  },
  {
    name: 'POCO F5',
    modelKey: 'poco-f5',
    year: 2023,
    slug: 'poco-f5',
    desc: 'Snapdragon 7+ Gen 2 POCO.',
    tiers: [{ gb: 256, listPrice: 449 }]
  },
  {
    name: 'POCO F6',
    modelKey: 'poco-f6',
    year: 2024,
    slug: 'poco-f6',
    desc: '2024 POCO performance phone.',
    tiers: [
      { gb: 256, listPrice: 499 },
      { gb: 512, listPrice: 549 }
    ]
  }
];

export const xiaomiPhones: CatalogParentDraft[] = miModels.map((m) =>
  phoneParent({
    name: m.name,
    modelKey: m.modelKey,
    brand: 'Xiaomi',
    releaseYear: m.year,
    description: m.desc,
    image: catalogImage(brand, m.slug),
    storageTiers: m.tiers
  })
);
