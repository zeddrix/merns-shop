import type { CatalogParentDraft } from '../types.js';
import { catalogImage, phoneParent } from '../helpers.js';

const brand = 'samsung';

const galaxyS: Array<{
  name: string;
  modelKey: string;
  year: number;
  slug: string;
  desc: string;
  tiers: Array<{ gb: number; listPrice: number }>;
}> = [
  {
    name: 'Galaxy S20',
    modelKey: 'galaxy-s20',
    year: 2020,
    slug: 'galaxy-s20',
    desc: '120Hz 8K video flagship.',
    tiers: [
      { gb: 128, listPrice: 999 },
      { gb: 512, listPrice: 1199 }
    ]
  },
  {
    name: 'Galaxy S20+',
    modelKey: 'galaxy-s20-plus',
    year: 2020,
    slug: 'galaxy-s20-plus',
    desc: 'Larger S20 with better battery.',
    tiers: [
      { gb: 128, listPrice: 1199 },
      { gb: 512, listPrice: 1399 }
    ]
  },
  {
    name: 'Galaxy S20 Ultra',
    modelKey: 'galaxy-s20-ultra',
    year: 2020,
    slug: 'galaxy-s20-ultra',
    desc: '100x Space Zoom S20 Ultra.',
    tiers: [
      { gb: 128, listPrice: 1399 },
      { gb: 512, listPrice: 1599 }
    ]
  },
  {
    name: 'Galaxy S21',
    modelKey: 'galaxy-s21',
    year: 2021,
    slug: 'galaxy-s21',
    desc: 'Compact flagship with Exynos/Snapdragon.',
    tiers: [
      { gb: 128, listPrice: 799 },
      { gb: 256, listPrice: 849 }
    ]
  },
  {
    name: 'Galaxy S21+',
    modelKey: 'galaxy-s21-plus',
    year: 2021,
    slug: 'galaxy-s21-plus',
    desc: 'Flat display S21+.',
    tiers: [
      { gb: 128, listPrice: 999 },
      { gb: 256, listPrice: 1049 }
    ]
  },
  {
    name: 'Galaxy S21 Ultra',
    modelKey: 'galaxy-s21-ultra',
    year: 2021,
    slug: 'galaxy-s21-ultra',
    desc: 'S Pen support on S21 Ultra.',
    tiers: [
      { gb: 128, listPrice: 1199 },
      { gb: 512, listPrice: 1399 }
    ]
  },
  {
    name: 'Galaxy S22',
    modelKey: 'galaxy-s22',
    year: 2022,
    slug: 'galaxy-s22',
    desc: 'Nightography compact flagship.',
    tiers: [
      { gb: 128, listPrice: 799 },
      { gb: 256, listPrice: 849 }
    ]
  },
  {
    name: 'Galaxy S22+',
    modelKey: 'galaxy-s22-plus',
    year: 2022,
    slug: 'galaxy-s22-plus',
    desc: 'Larger S22 with faster charging.',
    tiers: [
      { gb: 128, listPrice: 999 },
      { gb: 256, listPrice: 1049 }
    ]
  },
  {
    name: 'Galaxy S22 Ultra',
    modelKey: 'galaxy-s22-ultra',
    year: 2022,
    slug: 'galaxy-s22-ultra',
    desc: 'Built-in S Pen Galaxy Ultra.',
    tiers: [
      { gb: 128, listPrice: 1199 },
      { gb: 512, listPrice: 1399 },
      { gb: 1024, listPrice: 1599 }
    ]
  },
  {
    name: 'Galaxy S23',
    modelKey: 'galaxy-s23',
    year: 2023,
    slug: 'galaxy-s23',
    desc: 'Snapdragon 8 Gen 2 compact flagship.',
    tiers: [
      { gb: 128, listPrice: 799 },
      { gb: 256, listPrice: 859 }
    ]
  },
  {
    name: 'Galaxy S23+',
    modelKey: 'galaxy-s23-plus',
    year: 2023,
    slug: 'galaxy-s23-plus',
    desc: 'Larger battery S23+.',
    tiers: [
      { gb: 256, listPrice: 999 },
      { gb: 512, listPrice: 1099 }
    ]
  },
  {
    name: 'Galaxy S23 Ultra',
    modelKey: 'galaxy-s23-ultra',
    year: 2023,
    slug: 'galaxy-s23-ultra',
    desc: '200MP camera S23 Ultra.',
    tiers: [
      { gb: 256, listPrice: 1199 },
      { gb: 512, listPrice: 1399 },
      { gb: 1024, listPrice: 1599 }
    ]
  },
  {
    name: 'Galaxy S24',
    modelKey: 'galaxy-s24',
    year: 2024,
    slug: 'galaxy-s24',
    desc: 'Galaxy AI on S24.',
    tiers: [
      { gb: 128, listPrice: 799 },
      { gb: 256, listPrice: 859 }
    ]
  },
  {
    name: 'Galaxy S24+',
    modelKey: 'galaxy-s24-plus',
    year: 2024,
    slug: 'galaxy-s24-plus',
    desc: 'Larger Galaxy AI phone.',
    tiers: [
      { gb: 256, listPrice: 999 },
      { gb: 512, listPrice: 1099 }
    ]
  },
  {
    name: 'Galaxy S24 Ultra',
    modelKey: 'galaxy-s24-ultra',
    year: 2024,
    slug: 'galaxy-s24-ultra',
    desc: 'Titanium frame S24 Ultra.',
    tiers: [
      { gb: 256, listPrice: 1299 },
      { gb: 512, listPrice: 1419 },
      { gb: 1024, listPrice: 1619 }
    ]
  },
  {
    name: 'Galaxy S25',
    modelKey: 'galaxy-s25',
    year: 2025,
    slug: 'galaxy-s25',
    desc: 'Latest Galaxy S with upgraded AI.',
    tiers: [
      { gb: 128, listPrice: 799 },
      { gb: 256, listPrice: 859 }
    ]
  },
  {
    name: 'Galaxy S25+',
    modelKey: 'galaxy-s25-plus',
    year: 2025,
    slug: 'galaxy-s25-plus',
    desc: 'Plus-size 2025 Galaxy flagship.',
    tiers: [
      { gb: 256, listPrice: 999 },
      { gb: 512, listPrice: 1099 }
    ]
  },
  {
    name: 'Galaxy S25 Ultra',
    modelKey: 'galaxy-s25-ultra',
    year: 2025,
    slug: 'galaxy-s25-ultra',
    desc: 'Top 2025 Samsung smartphone.',
    tiers: [
      { gb: 256, listPrice: 1299 },
      { gb: 512, listPrice: 1419 },
      { gb: 1024, listPrice: 1619 }
    ]
  }
];

const foldables = [
  {
    name: 'Galaxy Z Fold3',
    modelKey: 'galaxy-z-fold3',
    year: 2021,
    slug: 'galaxy-z-fold3',
    desc: 'Under-display camera Fold.',
    tiers: [
      { gb: 256, listPrice: 1799 },
      { gb: 512, listPrice: 1899 }
    ]
  },
  {
    name: 'Galaxy Z Flip3',
    modelKey: 'galaxy-z-flip3',
    year: 2021,
    slug: 'galaxy-z-flip3',
    desc: 'Affordable flip phone redesign.',
    tiers: [
      { gb: 128, listPrice: 999 },
      { gb: 256, listPrice: 1099 }
    ]
  },
  {
    name: 'Galaxy Z Fold4',
    modelKey: 'galaxy-z-fold4',
    year: 2022,
    slug: 'galaxy-z-fold4',
    desc: 'Refined hinge Fold4.',
    tiers: [
      { gb: 256, listPrice: 1799 },
      { gb: 512, listPrice: 1919 }
    ]
  },
  {
    name: 'Galaxy Z Flip4',
    modelKey: 'galaxy-z-flip4',
    year: 2022,
    slug: 'galaxy-z-flip4',
    desc: 'Improved battery Flip4.',
    tiers: [
      { gb: 128, listPrice: 999 },
      { gb: 256, listPrice: 1059 }
    ]
  },
  {
    name: 'Galaxy Z Fold5',
    modelKey: 'galaxy-z-fold5',
    year: 2023,
    slug: 'galaxy-z-fold5',
    desc: 'Slimmer closed-gap Fold5.',
    tiers: [
      { gb: 256, listPrice: 1799 },
      { gb: 1024, listPrice: 2019 }
    ]
  },
  {
    name: 'Galaxy Z Flip5',
    modelKey: 'galaxy-z-flip5',
    year: 2023,
    slug: 'galaxy-z-flip5',
    desc: 'Large cover screen Flip5.',
    tiers: [
      { gb: 256, listPrice: 999 },
      { gb: 512, listPrice: 1119 }
    ]
  },
  {
    name: 'Galaxy Z Fold6',
    modelKey: 'galaxy-z-fold6',
    year: 2024,
    slug: 'galaxy-z-fold6',
    desc: 'AI-enhanced Fold6.',
    tiers: [
      { gb: 256, listPrice: 1899 },
      { gb: 1024, listPrice: 2119 }
    ]
  },
  {
    name: 'Galaxy Z Flip6',
    modelKey: 'galaxy-z-flip6',
    year: 2024,
    slug: 'galaxy-z-flip6',
    desc: 'Flip6 with Galaxy AI.',
    tiers: [
      { gb: 256, listPrice: 1099 },
      { gb: 512, listPrice: 1219 }
    ]
  }
];

const aSeries = [
  {
    name: 'Galaxy A51',
    modelKey: 'galaxy-a51',
    year: 2020,
    slug: 'galaxy-a51',
    desc: 'Popular mid-range Galaxy A.',
    tiers: [{ gb: 128, listPrice: 399 }]
  },
  {
    name: 'Galaxy A52',
    modelKey: 'galaxy-a52',
    year: 2021,
    slug: 'galaxy-a52',
    desc: '90Hz AMOLED mid-ranger.',
    tiers: [
      { gb: 128, listPrice: 349 },
      { gb: 256, listPrice: 399 }
    ]
  },
  {
    name: 'Galaxy A53',
    modelKey: 'galaxy-a53',
    year: 2022,
    slug: 'galaxy-a53',
    desc: 'Long software support A53.',
    tiers: [
      { gb: 128, listPrice: 449 },
      { gb: 256, listPrice: 509 }
    ]
  },
  {
    name: 'Galaxy A54',
    modelKey: 'galaxy-a54',
    year: 2023,
    slug: 'galaxy-a54',
    desc: 'Upgraded cameras A54.',
    tiers: [
      { gb: 128, listPrice: 449 },
      { gb: 256, listPrice: 509 }
    ]
  },
  {
    name: 'Galaxy A55',
    modelKey: 'galaxy-a55',
    year: 2024,
    slug: 'galaxy-a55',
    desc: 'Premium glass A55 design.',
    tiers: [
      { gb: 128, listPrice: 449 },
      { gb: 256, listPrice: 509 }
    ]
  },
  {
    name: 'Galaxy A35',
    modelKey: 'galaxy-a35',
    year: 2024,
    slug: 'galaxy-a35',
    desc: 'Budget-friendly 2024 Galaxy A.',
    tiers: [
      { gb: 128, listPrice: 399 },
      { gb: 256, listPrice: 459 }
    ]
  }
];

const all = [...galaxyS, ...foldables, ...aSeries];

export const samsungPhones: CatalogParentDraft[] = all.map((m) =>
  phoneParent({
    name: m.name,
    modelKey: m.modelKey,
    brand: 'Samsung',
    releaseYear: m.year,
    description: m.desc,
    image: catalogImage(brand, m.slug),
    storageTiers: m.tiers
  })
);
