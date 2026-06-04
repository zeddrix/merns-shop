import { describe, expect, it } from 'vitest';
import { listProducts, productListReducer } from '../../../frontend/src/features/productSlice';

describe('productSlice', () => {
  it('starts with empty product list state', () => {
    const state = productListReducer(undefined, { type: 'unknown' });
    expect(state.products).toEqual([]);
  });

  it('listProducts async thunk has expected type prefix', () => {
    expect(listProducts.pending.type).toBe('productList/list/pending');
  });
});
