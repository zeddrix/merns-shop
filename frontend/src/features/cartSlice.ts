import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import type { CartItem, Product, ProductVariant, ShippingAddress } from '../types';
import { getErrorMessage } from '../utils/getErrorMessage';

export interface CartState {
  cartItems: CartItem[];
  shippingAddress: ShippingAddress;
  paymentMethod?: string;
}

const cartItemsFromStorage = (): CartItem[] => {
  const stored = localStorage.getItem('cartItems');
  return stored ? (JSON.parse(stored) as CartItem[]) : [];
};

const shippingAddressFromStorage = (): ShippingAddress => {
  const stored = localStorage.getItem('shippingAddress');
  return stored ? (JSON.parse(stored) as ShippingAddress) : {};
};

const initialState: CartState = {
  cartItems: cartItemsFromStorage(),
  shippingAddress: shippingAddressFromStorage()
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
      localStorage.removeItem('cartItems');
    }
  },
  extraReducers: (builder) => {
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

export const { removeFromCart, saveShippingAddress, savePaymentMethod, clearCartItems } =
  cartSlice.actions;

export { cartLineKey };

export default cartSlice.reducer;
