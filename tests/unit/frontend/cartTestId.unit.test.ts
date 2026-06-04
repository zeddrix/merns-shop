import { describe, expect, it } from 'vitest';
import { cartLineTestId } from '../../../frontend/src/utils/cartTestId';

describe('cartLineTestId', () => {
  it('combines_product_and_variant_sku', () => {
    expect(cartLineTestId('prod1', 'iphone-15-pro-128gb')).toBe('prod1__iphone-15-pro-128gb');
  });
});
