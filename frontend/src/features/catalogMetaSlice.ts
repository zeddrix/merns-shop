import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import type { ProductMetaResponse } from '../types';
import { buildCacheKey, getCached, setCached } from '../utils/fetchCache';
import { getErrorMessage } from '../utils/getErrorMessage';

const META_CACHE_TTL_MS = 60_000;

const emptyMeta = (): ProductMetaResponse => ({
  brands: [],
  categories: [],
  subcategories: []
});

export interface CatalogMetaState {
  meta: ProductMetaResponse;
  loading: boolean;
  error?: string;
}

export const fetchCatalogMeta = createAsyncThunk(
  'catalogMeta/fetch',
  async (_void: undefined, { rejectWithValue }) => {
    const cacheKey = buildCacheKey('/api/products/meta');
    const cached = getCached<ProductMetaResponse>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const { data } = await axios.get<ProductMetaResponse>('/api/products/meta');
      setCached(cacheKey, data, META_CACHE_TTL_MS);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

const catalogMetaSlice = createSlice({
  name: 'catalogMeta',
  initialState: {
    meta: emptyMeta(),
    loading: false
  } as CatalogMetaState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCatalogMeta.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(fetchCatalogMeta.fulfilled, (state, action) => {
        state.loading = false;
        state.meta = action.payload;
      })
      .addCase(fetchCatalogMeta.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export default catalogMetaSlice.reducer;
