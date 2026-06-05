import { describe, expect, it } from 'vitest';
import { firstInStockSku } from '../../../frontend/src/utils/defaultVariant';

describe('firstInStockSku', () => {
  it('returns_first_in_stock_variant_sku', () => {
    expect(
      firstInStockSku([
        { sku: 'a-oos', label: 'A', listPrice: 1, price: 1, countInStock: 0 },
        { sku: 'b-stock', label: 'B', listPrice: 1, price: 1, countInStock: 5 },
        { sku: 'c-stock', label: 'C', listPrice: 1, price: 1, countInStock: 3 }
      ])
    ).toBe('b-stock');
  });

  it('returns_empty_when_all_out_of_stock', () => {
    expect(
      firstInStockSku([{ sku: 'x', label: 'X', listPrice: 1, price: 1, countInStock: 0 }])
    ).toBe('');
  });
});
