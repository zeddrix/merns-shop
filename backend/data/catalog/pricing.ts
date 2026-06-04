import type { PricingCategory } from './types.js';

const DISCOUNT_RATES: Record<PricingCategory, number> = {
  Phones: 0.3,
  Tablets: 0.28,
  Laptops: 0.25,
  Wearables: 0.32,
  TVs: 0.35,
  Consoles: 0.22,
  Audio: 0.3
};

export const applyTieredPrice = (listPrice: number, category: PricingCategory): number => {
  const rate = DISCOUNT_RATES[category];
  return Math.round(listPrice * (1 - rate) * 100) / 100;
};
