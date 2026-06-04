import { configureStore } from '@reduxjs/toolkit';
import cartReducer from '../features/cartSlice';
import {
  productListReducer,
  productDetailsReducer,
  productDeleteReducer,
  productCreateReducer,
  productUpdateReducer,
  productReviewCreateReducer,
  productTopRatedReducer
} from '../features/productSlice';
import {
  userLoginReducer,
  userRegisterReducer,
  userDetailsReducer,
  userUpdateProfileReducer,
  userListReducer,
  userDeleteReducer,
  userUpdateReducer
} from '../features/userSlice';
import {
  orderCreateReducer,
  orderDetailsReducer,
  orderPayReducer,
  orderDeliverReducer,
  myOrderReducer,
  orderListReducer
} from '../features/orderSlice';
import type { CartItem, ShippingAddress } from '../types';

const cartItemsFromStorage = (): CartItem[] => {
  const stored = localStorage.getItem('cartItems');
  return stored ? (JSON.parse(stored) as CartItem[]) : [];
};

const shippingAddressFromStorage = (): ShippingAddress => {
  const stored = localStorage.getItem('shippingAddress');
  return stored ? (JSON.parse(stored) as ShippingAddress) : {};
};

export const store = configureStore({
  reducer: {
    productList: productListReducer,
    productDetails: productDetailsReducer,
    productDelete: productDeleteReducer,
    productCreate: productCreateReducer,
    productUpdate: productUpdateReducer,
    productReviewCreate: productReviewCreateReducer,
    productTopRated: productTopRatedReducer,
    cart: cartReducer,
    userLogin: userLoginReducer,
    userRegister: userRegisterReducer,
    userDetails: userDetailsReducer,
    userUpdateProfile: userUpdateProfileReducer,
    userList: userListReducer,
    userDelete: userDeleteReducer,
    userUpdate: userUpdateReducer,
    orderCreate: orderCreateReducer,
    orderDetails: orderDetailsReducer,
    orderPay: orderPayReducer,
    orderDeliver: orderDeliverReducer,
    myOrder: myOrderReducer,
    orderList: orderListReducer
  },
  preloadedState: {
    cart: {
      cartItems: cartItemsFromStorage(),
      shippingAddress: shippingAddressFromStorage()
    },
    userLogin: {}
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false
    })
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
