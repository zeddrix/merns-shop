import { describe, expect, it } from 'vitest';
import { applyTieredPrice } from '../../../backend/data/catalog/pricing.js';

describe('catalog pricing', () => {
  it('applies 30% off for phones', () => {
    expect(applyTieredPrice(1000, 'Phones')).toBe(700);
  });

  it('applies 35% off for TVs', () => {
    expect(applyTieredPrice(1000, 'TVs')).toBe(650);
  });

  it('applies 22% off for consoles', () => {
    expect(applyTieredPrice(500, 'Consoles')).toBe(390);
  });
});
