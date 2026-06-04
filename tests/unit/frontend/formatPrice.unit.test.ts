import { describe, expect, it } from 'vitest';
import { calcSavingsPercent, formatPrice } from '../../../frontend/src/utils/formatPrice';

describe('formatPrice', () => {
  it('formats USD currency', () => {
    expect(formatPrice(99.5)).toBe('$99.50');
  });

  it('calculates savings percent', () => {
    expect(calcSavingsPercent(100, 70)).toBe(30);
  });
});
