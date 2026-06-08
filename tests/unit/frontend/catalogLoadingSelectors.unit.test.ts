import { describe, expect, it } from 'vitest';
import { selectIsCatalogApiLoading } from '../../../frontend/src/features/catalogLoadingSelectors';
import type { ProductDetailsState } from '../../../frontend/src/features/productSlice';
import type { RootState } from '../../../frontend/src/store/store';

type CatalogLoadingSliceState = Pick<
  RootState,
  'productList' | 'productTopRated' | 'productDetails' | 'catalogMeta' | 'cart'
>;

const baseCatalogState: CatalogLoadingSliceState = {
  productList: { products: [], loading: false },
  productTopRated: { products: [], loading: false },
  productDetails: { loading: false, product: { variants: [] } } as unknown as ProductDetailsState,
  catalogMeta: {
    meta: { brands: [], categories: [], subcategories: [] },
    loading: false
  },
  cart: { cartItems: [], shippingAddress: {}, staleItemsPruned: false, rehydrating: false }
};

const asRootState = (slices: CatalogLoadingSliceState): RootState => slices as unknown as RootState;

describe('selectIsCatalogApiLoading', () => {
  it('returns_false_when_no_catalog_requests_are_pending', () => {
    expect(selectIsCatalogApiLoading(asRootState(baseCatalogState))).toBe(false);
  });

  it('returns_true_when_product_list_is_loading', () => {
    const state = asRootState({
      ...baseCatalogState,
      productList: { ...baseCatalogState.productList, loading: true }
    });

    expect(selectIsCatalogApiLoading(state)).toBe(true);
  });

  it('returns_true_when_top_rated_products_are_loading', () => {
    const state = asRootState({
      ...baseCatalogState,
      productTopRated: { ...baseCatalogState.productTopRated, loading: true }
    });

    expect(selectIsCatalogApiLoading(state)).toBe(true);
  });

  it('returns_true_when_product_details_are_loading', () => {
    const state = asRootState({
      ...baseCatalogState,
      productDetails: { ...baseCatalogState.productDetails, loading: true }
    });

    expect(selectIsCatalogApiLoading(state)).toBe(true);
  });

  it('returns_true_when_cart_is_rehydrating', () => {
    const state = asRootState({
      ...baseCatalogState,
      cart: { ...baseCatalogState.cart, rehydrating: true }
    });

    expect(selectIsCatalogApiLoading(state)).toBe(true);
  });

  it('returns_true_when_catalog_meta_is_loading', () => {
    const state = asRootState({
      ...baseCatalogState,
      catalogMeta: { ...baseCatalogState.catalogMeta, loading: true }
    });

    expect(selectIsCatalogApiLoading(state)).toBe(true);
  });
});
