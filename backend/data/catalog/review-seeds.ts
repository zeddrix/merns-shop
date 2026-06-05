import type { Types } from 'mongoose';
import type { CatalogParentDraft } from './types.js';

export interface SeedReviewDraft {
  name: string;
  rating: number;
  comment: string;
  user: Types.ObjectId;
}

const COMMENT_POOLS: Record<string, string[]> = {
  Phones: [
    'Battery life is solid for a refurbished unit and the screen looks flawless.',
    'Setup was quick and the camera quality exceeded my expectations.',
    'Arrived well packaged; performance feels snappy for everyday apps.',
    'Face ID and speakers work perfectly. Great value versus buying new.',
    'No noticeable scratches. Cellular and Wi-Fi connectivity are stable.'
  ],
  Tablets: [
    'Display is bright and responsive; Apple Pencil pairing worked immediately.',
    'Perfect for reading and video; battery holds up through a full workday.',
    'Kickstand case fits well; this tablet feels premium despite the discount.',
    'Smooth scrolling and no dead zones on the touchscreen.',
    'Runs the latest OS without lag; ideal for students and travel.'
  ],
  Laptops: [
    'Keyboard and trackpad feel tight; fans stay quiet under normal loads.',
    'Boot time is fast and the display has no backlight bleed.',
    'Handles video calls and office work without breaking a sweat.',
    'Ports all work; sleep/wake is reliable after a week of use.',
    'Great machine for development and browsing with plenty of RAM.'
  ],
  TVs: [
    'Picture is sharp and colors look natural out of the box.',
    'Smart apps load quickly and the remote is responsive.',
    'No dead pixels; motion handling is good for sports.',
    'Sound is clear enough for a bedroom; easy to pair with a soundbar.',
    'HDMI ARC works with my receiver; setup took minutes.'
  ],
  Consoles: [
    'Runs quietly and loads games from SSD without issues.',
    'Controllers connect instantly; online play has been stable.',
    'Disc drive reads quickly; no overheating during long sessions.',
    'Graphics look great on my 4K TV; refurbished price was a steal.',
    'Packaging was secure; console booted to latest firmware.'
  ],
  Audio: [
    'Balanced sound with good bass; pairing to my phone was painless.',
    'Mic pickup is clear for calls; battery lasts through commutes.',
    'Noise isolation is better than I expected for refurbished gear.',
    'Comfortable for long listening sessions; no crackling at volume.',
    'Quick charge works; case hinge feels sturdy.'
  ],
  Wearables: [
    'Heart rate and step tracking match my other devices closely.',
    'Band adjustment is easy; display is readable outdoors.',
    'Notifications arrive instantly; battery gets through two days.',
    'Sleep tracking seems accurate; sync with phone is reliable.',
    'Looks like new on the wrist; sensors calibrated correctly.'
  ],
  'Smart Speakers': [
    'Voice recognition works in a busy kitchen; music sounds full.',
    'Setup with the app took under five minutes.',
    'Smart home routines trigger consistently.',
    'No distortion at normal volumes; Wi-Fi stays connected.',
    'Compact footprint but surprisingly loud for its size.'
  ]
};

const hashModelKey = (modelKey: string): number => {
  let hash = 0;
  for (let i = 0; i < modelKey.length; i += 1) {
    hash = (hash * 31 + modelKey.charCodeAt(i)) >>> 0;
  }
  return hash;
};

const NO_REVIEW_MODEL_KEYS = new Set(['amazon-echo-dot-3-fixture']);

/** Catalog parents that must always ship with embedded reviews (E2E + hero products). */
const ALWAYS_REVIEW_MODEL_KEYS = new Set(['iphone-15-pro', 'ipad-air-m2']);

/** ~18% of catalog parents have no embedded reviews (empty-state QA). */
export const productHasSeedReviews = (modelKey: string): boolean => {
  if (NO_REVIEW_MODEL_KEYS.has(modelKey)) {
    return false;
  }
  if (ALWAYS_REVIEW_MODEL_KEYS.has(modelKey)) {
    return true;
  }
  return hashModelKey(modelKey) % 11 !== 0;
};

const SEED_REVIEWER_NAMES = [
  'Alex M.',
  'Jordan K.',
  'Sam R.',
  'Taylor P.',
  'Casey L.',
  'Riley N.',
  'Morgan T.',
  'Jamie W.'
];

export const buildSeedReviewsForProduct = (
  parent: CatalogParentDraft,
  reviewerUserId: Types.ObjectId
): SeedReviewDraft[] => {
  if (!productHasSeedReviews(parent.modelKey)) {
    return [];
  }

  const pool = COMMENT_POOLS[parent.subcategory] ?? COMMENT_POOLS.Phones;
  const count = 3 + (hashModelKey(parent.modelKey) % 6);
  const reviews: SeedReviewDraft[] = [];

  for (let i = 0; i < count; i += 1) {
    const rating = 3 + (hashModelKey(`${parent.modelKey}-${i}`) % 3);
    reviews.push({
      name: SEED_REVIEWER_NAMES[i % SEED_REVIEWER_NAMES.length],
      rating,
      comment: pool[hashModelKey(`${parent.modelKey}-c-${i}`) % pool.length] ?? pool[0],
      user: reviewerUserId
    });
  }

  return reviews;
};

export const averageRating = (reviews: SeedReviewDraft[]): number => {
  if (reviews.length === 0) {
    return 0;
  }
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return Math.round((sum / reviews.length) * 10) / 10;
};
