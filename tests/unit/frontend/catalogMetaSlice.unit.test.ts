import { describe, expect, it, vi, beforeEach } from 'vitest';

const axiosGet = vi.hoisted(() => vi.fn());

vi.mock('axios', () => ({
  default: {
    get: axiosGet
  }
}));

import catalogMetaReducer, {
  fetchCatalogMeta
} from '../../../frontend/src/features/catalogMetaSlice';

describe('catalogMetaSlice', () => {
  beforeEach(() => {
    axiosGet.mockReset();
  });

  it('sets_loading_true_on_fetch_pending', () => {
    const state = catalogMetaReducer(undefined, { type: fetchCatalogMeta.pending.type });
    expect(state.loading).toBe(true);
  });

  it('stores_meta_and_clears_loading_on_fulfilled', () => {
    const payload = {
      brands: ['Apple'],
      categories: ['Phones'],
      subcategories: ['Smartphones']
    };

    const state = catalogMetaReducer(undefined, {
      type: fetchCatalogMeta.fulfilled.type,
      payload
    });

    expect(state.loading).toBe(false);
    expect(state.meta).toEqual(payload);
  });

  it('stores_error_and_clears_loading_on_rejected', () => {
    const state = catalogMetaReducer(undefined, {
      type: fetchCatalogMeta.rejected.type,
      payload: 'Network error'
    });

    expect(state.loading).toBe(false);
    expect(state.error).toBe('Network error');
  });
});
