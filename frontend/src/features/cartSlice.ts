import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import type { CartItem, Product, ShippingAddress } from '../types';
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

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({ id, qty }: { id: string; qty: number }, { rejectWithValue }) => {
    try {
      const { data } = await axios.get<Product>(`/api/products/${id}`);
      return {
        product: data._id,
        name: data.name,
        image: data.image,
        price: data.price,
        countInStock: data.countInStock,
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
      state.cartItems = state.cartItems.filter((x) => x.product !== action.payload);
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
      const existItem = state.cartItems.find((x) => x.product === item.product);
      if (existItem) {
        state.cartItems = state.cartItems.map((x) => (x.product === existItem.product ? item : x));
      } else {
        state.cartItems.push(item);
      }
      localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
    });
  }
});

export const { removeFromCart, saveShippingAddress, savePaymentMethod, clearCartItems } =
  cartSlice.actions;

export default cartSlice.reducer;
