import type { CatalogParentDraft } from '../types.js';
import { catalogImage, phoneParent } from '../helpers.js';

const brand = 'vivo';

const vivoModels = [
  {
    name: 'vivo X50 Pro',
    modelKey: 'vivo-x50-pro',
    year: 2020,
    slug: 'vivo-x50-pro',
    desc: 'Gimbal stabilization camera phone.',
    tiers: [{ gb: 256, listPrice: 699 }]
  },
  {
    name: 'vivo X60 Pro',
    modelKey: 'vivo-x60-pro',
    year: 2021,
    slug: 'vivo-x60-pro',
    desc: 'Zeiss optics X60 Pro.',
    tiers: [{ gb: 256, listPrice: 749 }]
  },
  {
    name: 'vivo X70 Pro+',
    modelKey: 'vivo-x70-pro-plus',
    year: 2021,
    slug: 'vivo-x70-pro-plus',
    desc: 'Flagship V1 imaging chip.',
    tiers: [
      { gb: 256, listPrice: 899 },
      { gb: 512, listPrice: 999 }
    ]
  },
  {
    name: 'vivo X80 Pro',
    modelKey: 'vivo-x80-pro',
    year: 2022,
    slug: 'vivo-x80-pro',
    desc: 'Snapdragon 8 Gen 1 camera flagship.',
    tiers: [
      { gb: 256, listPrice: 899 },
      { gb: 512, listPrice: 999 }
    ]
  },
  {
    name: 'vivo X90 Pro',
    modelKey: 'vivo-x90-pro',
    year: 2023,
    slug: 'vivo-x90-pro',
    desc: '1-inch IMX989 main sensor.',
    tiers: [
      { gb: 256, listPrice: 899 },
      { gb: 512, listPrice: 999 }
    ]
  },
  {
    name: 'vivo X100 Pro',
    modelKey: 'vivo-x100-pro',
    year: 2024,
    slug: 'vivo-x100-pro',
    desc: 'MediaTek Dimensity 9300 flagship.',
    tiers: [
      { gb: 256, listPrice: 899 },
      { gb: 512, listPrice: 999 }
    ]
  },
  {
    name: 'vivo X200 Pro',
    modelKey: 'vivo-x200-pro',
    year: 2025,
    slug: 'vivo-x200-pro',
    desc: 'Latest vivo camera flagship.',
    tiers: [
      { gb: 256, listPrice: 949 },
      { gb: 512, listPrice: 1049 }
    ]
  },
  {
    name: 'vivo V21',
    modelKey: 'vivo-v21',
    year: 2021,
    slug: 'vivo-v21',
    desc: 'Sleek mid-range with OIS selfie.',
    tiers: [{ gb: 128, listPrice: 399 }]
  },
  {
    name: 'vivo V23',
    modelKey: 'vivo-v23',
    year: 2022,
    slug: 'vivo-v23',
    desc: 'Color-changing glass V series.',
    tiers: [
      { gb: 128, listPrice: 399 },
      { gb: 256, listPrice: 449 }
    ]
  },
  {
    name: 'vivo V25',
    modelKey: 'vivo-v25',
    year: 2022,
    slug: 'vivo-v25',
    desc: 'Portrait-focused V25.',
    tiers: [
      { gb: 128, listPrice: 449 },
      { gb: 256, listPrice: 499 }
    ]
  },
  {
    name: 'vivo V27',
    modelKey: 'vivo-v27',
    year: 2023,
    slug: 'vivo-v27',
    desc: 'Curved AMOLED V27.',
    tiers: [
      { gb: 128, listPrice: 449 },
      { gb: 256, listPrice: 499 }
    ]
  },
  {
    name: 'vivo V29',
    modelKey: 'vivo-v29',
    year: 2023,
    slug: 'vivo-v29',
    desc: 'Aura light portrait V29.',
    tiers: [{ gb: 256, listPrice: 499 }]
  },
  {
    name: 'vivo V40',
    modelKey: 'vivo-v40',
    year: 2024,
    slug: 'vivo-v40',
    desc: 'Slim 2024 V series phone.',
    tiers: [{ gb: 256, listPrice: 499 }]
  },
  {
    name: 'vivo V50',
    modelKey: 'vivo-v50',
    year: 2025,
    slug: 'vivo-v50',
    desc: '2025 vivo V series.',
    tiers: [{ gb: 256, listPrice: 529 }]
  },
  {
    name: 'vivo Y20',
    modelKey: 'vivo-y20',
    year: 2020,
    slug: 'vivo-y20',
    desc: 'Budget Y series battery phone.',
    tiers: [{ gb: 64, listPrice: 179 }]
  },
  {
    name: 'vivo Y33s',
    modelKey: 'vivo-y33s',
    year: 2021,
    slug: 'vivo-y33s',
    desc: 'Affordable 50MP Y phone.',
    tiers: [{ gb: 128, listPrice: 249 }]
  },
  {
    name: 'vivo Y36',
    modelKey: 'vivo-y36',
    year: 2023,
    slug: 'vivo-y36',
    desc: 'Fast charging budget vivo.',
    tiers: [
      { gb: 128, listPrice: 249 },
      { gb: 256, listPrice: 279 }
    ]
  },
  {
    name: 'vivo Y100',
    modelKey: 'vivo-y100',
    year: 2024,
    slug: 'vivo-y100',
    desc: 'Premium-feel budget Y100.',
    tiers: [
      { gb: 128, listPrice: 299 },
      { gb: 256, listPrice: 329 }
    ]
  }
];

export const vivoPhones: CatalogParentDraft[] = vivoModels.map((m) =>
  phoneParent({
    name: m.name,
    modelKey: m.modelKey,
    brand: 'Vivo',
    releaseYear: m.year,
    description: m.desc,
    image: catalogImage(brand, m.slug),
    storageTiers: m.tiers
  })
);
