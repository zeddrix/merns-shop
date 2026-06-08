import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import type { CartItem, Product, ProductVariant, ShippingAddress } from '../types';
import { getErrorMessage } from '../utils/getErrorMessage';

export interface CartState {
  cartItems: CartItem[];
  shippingAddress: ShippingAddress;
  paymentMethod?: string;
  staleItemsPruned: boolean;
}

const cartItemsFromStorage = (): CartItem[] => {
  const stored = localStorage.getItem('cartItems');
  return stored ? (JSON.parse(stored) as CartItem[]) : [];
};

const shippingAddressFromStorage = (): ShippingAddress => {
  const stored = localStorage.getItem('shippingAddress');
  return stored ? (JSON.parse(stored) as ShippingAddress) : {};
};

const paymentMethodFromStorage = (): string | undefined => {
  const stored = localStorage.getItem('paymentMethod');
  if (!stored) {
    return undefined;
  }
  try {
    return JSON.parse(stored) as string;
  } catch {
    return undefined;
  }
};

const initialState: CartState = {
  cartItems: cartItemsFromStorage(),
  shippingAddress: shippingAddressFromStorage(),
  paymentMethod: paymentMethodFromStorage(),
  staleItemsPruned: false
};

const cartLineKey = (productId: string, variantSku: string) => `${productId}:${variantSku}`;

const resolveVariantFromProduct = (
  product: Product,
  variantSku: string
): ProductVariant | undefined => {
  if (!variantSku) {
    return product.variants[0];
  }
  return product.variants.find((v) => v.sku === variantSku);
};

export const rehydrateCart = createAsyncThunk(
  'cart/rehydrateCart',
  async (_void: undefined, { getState }) => {
    const { cartItems } = (getState() as { cart: CartState }).cart;
    if (cartItems.length === 0) {
      return { cartItems: [], pruned: false };
    }

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return { cartItems, pruned: false };
    }

    const validItems: CartItem[] = [];
    for (const item of cartItems) {
      try {
        await axios.get<Product>(`/api/products/${item.product}`);
        validItems.push(item);
      } catch {
        // Drop stale cart lines whose product no longer exists after re-seed.
      }
    }

    return {
      cartItems: validItems,
      pruned: validItems.length !== cartItems.length
    };
  }
);

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async (
    { id, qty, variantSku }: { id: string; qty: number; variantSku: string },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await axios.get<Product>(`/api/products/${id}`);
      const variant = resolveVariantFromProduct(data, variantSku);
      if (!variant) {
        return rejectWithValue('Invalid product variant');
      }
      const image = variant.image ?? data.image;
      return {
        product: data._id,
        variantSku: variant.sku,
        variantLabel: variant.label,
        name: `${data.name} (${variant.label})`,
        image,
        price: variant.price,
        countInStock: variant.countInStock,
        qty
      } satisfies CartItem;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.cartItems = state.cartItems.filter(
        (x) => cartLineKey(x.product, x.variantSku) !== action.payload
      );
      localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
    },
    saveShippingAddress: (state, action: PayloadAction<ShippingAddress>) => {
      state.shippingAddress = action.payload;
      localStorage.setItem('shippingAddress', JSON.stringify(action.payload));
    },
    savePaymentMethod: (state, action: PayloadAction<string>) => {
      state.paymentMethod = action.payload;
      localStorage.setItem('paymentMethod', JSON.stringify(action.payload));
    },
    clearCartItems: (state) => {
      state.cartItems = [];
      state.staleItemsPruned = false;
      localStorage.removeItem('cartItems');
    },
    clearStaleItemsNotice: (state) => {
      state.staleItemsPruned = false;
    }
  },
  extraReducers: (builder) => {
    builder.addCase(rehydrateCart.fulfilled, (state, action) => {
      state.cartItems = action.payload.cartItems;
      state.staleItemsPruned = action.payload.pruned;
      localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
    });
    builder.addCase(addToCart.fulfilled, (state, action) => {
      const item = action.payload;
      const key = cartLineKey(item.product, item.variantSku);
      const existItem = state.cartItems.find((x) => cartLineKey(x.product, x.variantSku) === key);
      if (existItem) {
        state.cartItems = state.cartItems.map((x) =>
          cartLineKey(x.product, x.variantSku) === key ? item : x
        );
      } else {
        state.cartItems.push(item);
      }
      localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
    });
  }
});

export const {
  removeFromCart,
  saveShippingAddress,
  savePaymentMethod,
  clearCartItems,
  clearStaleItemsNotice
} = cartSlice.actions;

export { cartLineKey };

export default cartSlice.reducer;
