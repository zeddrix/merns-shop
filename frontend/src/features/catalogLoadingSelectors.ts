import type { RootState } from '../store/store';

export const selectIsCatalogApiLoading = (state: RootState): boolean =>
  Boolean(state.productList.loading) ||
  Boolean(state.productTopRated.loading) ||
  Boolean(state.productDetails.loading) ||
  Boolean(state.catalogMeta.loading) ||
  Boolean(state.cart.rehydrating);
