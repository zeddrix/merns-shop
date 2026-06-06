import { describe, expect, it } from 'vitest';
import {
  listProducts,
  productListReducer,
  productDetailsReducer,
  listProductDetails
} from '../../../frontend/src/features/productSlice';
import type { Product } from '../../../frontend/src/types';

describe('productSlice', () => {
  it('starts with empty product list state', () => {
    const state = productListReducer(undefined, { type: 'unknown' });
    expect(state.products).toEqual([]);
  });

  it('listProducts async thunk has expected type prefix', () => {
    expect(listProducts.pending.type).toBe('productList/list/pending');
  });

  it('productListReducer stores products and pagination on fulfilled', () => {
    const payload = {
      products: [{ _id: 'p1', name: 'Phone' }] as Product[],
      page: 2,
      pages: 5
    };

    const state = productListReducer(undefined, {
      type: listProducts.fulfilled.type,
      payload
    });

    expect(state.products).toEqual(payload.products);
    expect(state.page).toBe(2);
    expect(state.pages).toBe(5);
    expect(state.loading).toBe(false);
  });

  it('productListReducer stores error on rejected', () => {
    const state = productListReducer(undefined, {
      type: listProducts.rejected.type,
      payload: 'Network error',
      error: { message: 'Rejected' }
    });

    expect(state.error).toBe('Network error');
    expect(state.loading).toBe(false);
  });

  it('productDetailsReducer stores product on fulfilled', () => {
    const product = { _id: 'p2', name: 'Tablet' } as Product;
    const state = productDetailsReducer(undefined, {
      type: listProductDetails.fulfilled.type,
      payload: product
    });

    expect(state.product).toEqual(product);
    expect(state.loading).toBe(false);
  });
});
