import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import type { Product, ProductListResponse } from '../types';
import type { UserInfo } from '../types';

interface AuthSliceState {
  userInfo?: UserInfo;
}

interface ProductSliceRootState {
  userLogin: AuthSliceState;
}
import { getErrorMessage } from '../utils/getErrorMessage';
import { logout } from './userSlice';

const getAuthConfig = (token: string) => ({
  headers: { Authorization: `Bearer ${token}` }
});

const handleAuthError = (message: string, dispatch: (action: unknown) => void) => {
  if (message === 'Not authorized, token failed') {
    dispatch(logout());
  }
};

// --- product list ---

export interface ProductListState {
  products: Product[];
  page?: number;
  pages?: number;
  loading?: boolean;
  error?: string;
}

export const listProducts = createAsyncThunk(
  'productList/list',
  async (
    { keyword = '', pageNumber = '' }: { keyword?: string; pageNumber?: string },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await axios.get<ProductListResponse>(
        `/api/products?keyword=${keyword}&pageNumber=${pageNumber}`
      );
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

const productListSlice = createSlice({
  name: 'productList',
  initialState: { products: [] } as ProductListState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(listProducts.pending, (state) => {
        state.loading = true;
        state.products = [];
      })
      .addCase(listProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products;
        state.pages = action.payload.pages;
        state.page = action.payload.page;
      })
      .addCase(listProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

// --- product details ---

export interface ProductDetailsState {
  product: Product;
  loading?: boolean;
  error?: string;
}

const emptyProduct = (): Product => ({
  _id: '',
  name: '',
  image: '',
  brand: '',
  category: '',
  description: '',
  reviews: [],
  rating: 0,
  numReviews: 0,
  price: 0,
  countInStock: 0,
  user: ''
});

export const listProductDetails = createAsyncThunk(
  'productDetails/fetch',
  async (id: string, { rejectWithValue }) => {
    try {
      const { data } = await axios.get<Product>(`/api/products/${id}`);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// --- product delete ---

export interface ProductMutationState {
  loading?: boolean;
  error?: string;
  success?: boolean;
  product?: Product;
}

export const deleteProduct = createAsyncThunk(
  'productDelete/delete',
  async (id: string, { getState, dispatch, rejectWithValue }) => {
    try {
      const { userLogin } = getState() as ProductSliceRootState;
      const token = userLogin.userInfo?.token;
      if (!token) throw new Error('Not authenticated');
      await axios.delete(`/api/products/${id}`, getAuthConfig(token));
      return undefined;
    } catch (error) {
      const message = getErrorMessage(error);
      handleAuthError(message, dispatch);
      return rejectWithValue(message);
    }
  }
);

const productDeleteSlice = createSlice({
  name: 'productDelete',
  initialState: {} as ProductMutationState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(deleteProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteProduct.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

// --- product create ---

export const createProduct = createAsyncThunk(
  'productCreate/create',
  async (_void: undefined, { getState, dispatch, rejectWithValue }) => {
    try {
      const { userLogin } = getState() as ProductSliceRootState;
      const token = userLogin.userInfo?.token;
      if (!token) throw new Error('Not authenticated');
      const { data } = await axios.post<Product>('/api/products', {}, getAuthConfig(token));
      return data;
    } catch (error) {
      const message = getErrorMessage(error);
      handleAuthError(message, dispatch);
      return rejectWithValue(message);
    }
  }
);

const productCreateSlice = createSlice({
  name: 'productCreate',
  initialState: {} as ProductMutationState,
  reducers: {
    productCreateReset: () => ({})
  },
  extraReducers: (builder) => {
    builder
      .addCase(createProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.product = action.payload;
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

// --- product update ---

export const updateProduct = createAsyncThunk(
  'productUpdate/update',
  async (product: Product, { getState, dispatch, rejectWithValue }) => {
    try {
      const { userLogin } = getState() as ProductSliceRootState;
      const token = userLogin.userInfo?.token;
      if (!token) throw new Error('Not authenticated');
      const { data } = await axios.put<Product>(`/api/products/${product._id}`, product, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      return data;
    } catch (error) {
      const message = getErrorMessage(error);
      handleAuthError(message, dispatch);
      return rejectWithValue(message);
    }
  }
);

const productUpdateSlice = createSlice({
  name: 'productUpdate',
  initialState: { product: emptyProduct() } as ProductMutationState,
  reducers: {
    productUpdateReset: () => ({ product: emptyProduct() })
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.product = action.payload;
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

const productDetailsSlice = createSlice({
  name: 'productDetails',
  initialState: { product: emptyProduct() } as ProductDetailsState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(listProductDetails.pending, (state) => {
        state.loading = true;
      })
      .addCase(listProductDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.product = action.payload;
      })
      .addCase(listProductDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.product = action.payload;
      });
  }
});

// --- product review create ---

export const createProductReview = createAsyncThunk(
  'productReviewCreate/create',
  async (
    { productId, review }: { productId: string; review: { rating: number; comment: string } },
    { getState, dispatch, rejectWithValue }
  ) => {
    try {
      const { userLogin } = getState() as ProductSliceRootState;
      const token = userLogin.userInfo?.token;
      if (!token) throw new Error('Not authenticated');
      await axios.post(`/api/products/${productId}/reviews`, review, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      return undefined;
    } catch (error) {
      const message = getErrorMessage(error);
      handleAuthError(message, dispatch);
      return rejectWithValue(message);
    }
  }
);

const productReviewCreateSlice = createSlice({
  name: 'productReviewCreate',
  initialState: {} as ProductMutationState,
  reducers: {
    productReviewCreateReset: () => ({})
  },
  extraReducers: (builder) => {
    builder
      .addCase(createProductReview.pending, (state) => {
        state.loading = true;
      })
      .addCase(createProductReview.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(createProductReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

// --- top rated ---

export const listTopProducts = createAsyncThunk(
  'productTopRated/list',
  async (_void: undefined, { rejectWithValue }) => {
    try {
      const { data } = await axios.get<Product[]>('/api/products/top');
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

const productTopRatedSlice = createSlice({
  name: 'productTopRated',
  initialState: { products: [] } as ProductListState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(listTopProducts.pending, (state) => {
        state.loading = true;
        state.products = [];
      })
      .addCase(listTopProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(listTopProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { productCreateReset } = productCreateSlice.actions;
export const { productUpdateReset } = productUpdateSlice.actions;
export const { productReviewCreateReset } = productReviewCreateSlice.actions;

export const productListReducer = productListSlice.reducer;
export const productDetailsReducer = productDetailsSlice.reducer;
export const productDeleteReducer = productDeleteSlice.reducer;
export const productCreateReducer = productCreateSlice.reducer;
export const productUpdateReducer = productUpdateSlice.reducer;
export const productReviewCreateReducer = productReviewCreateSlice.reducer;
export const productTopRatedReducer = productTopRatedSlice.reducer;
