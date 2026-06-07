import { describe, expect, it } from 'vitest';
import { OUT_OF_STOCK_LABEL } from '../../../frontend/src/constants/stock';

describe('stock label constant', () => {
  it('uses sentence case out of stock copy', () => {
    expect(OUT_OF_STOCK_LABEL).toBe('Out of stock');
  });
});
