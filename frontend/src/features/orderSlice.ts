import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { axios } from '../api/http';
import { hasSession } from '../utils/requireSession';
import type { Order, PaymentResult } from '../types';
import type { UserInfo } from '../types';

interface OrderSliceRootState {
  userLogin: { userInfo?: UserInfo };
}
import { getErrorMessage } from '../utils/getErrorMessage';
import { clearCartItems } from './cartSlice';
import { logout } from './userSlice';

export interface OrderMutationState {
  loading?: boolean;
  error?: string;
  success?: boolean;
  order?: Order;
}

export interface OrderListState {
  orders: Order[];
  loading?: boolean;
  error?: string;
}

interface CreateOrderPayload {
  orderItems: Order['orderItems'];
  shippingAddress: Order['shippingAddress'];
  paymentMethod: string;
  itemsPrice: string;
  shippingPrice: string;
  taxPrice: string;
  totalPrice: string;
}

const handleAuthError = (
  message: string,
  dispatch: (action: ReturnType<typeof logout>) => void
) => {
  if (message === 'Not authorized, token failed') {
    dispatch(logout());
  }
};

export const createOrder = createAsyncThunk(
  'orderCreate/create',
  async (order: CreateOrderPayload, { getState, dispatch, rejectWithValue }) => {
    try {
      const { userLogin } = getState() as OrderSliceRootState;
      if (!hasSession(userLogin.userInfo)) throw new Error('Not authenticated');
      const { data } = await axios.post<Order>('/api/orders', {
        ...order,
        orderItems: order.orderItems.map((item) => ({
          product: item.product,
          qty: item.qty,
          variantSku: item.variantSku
        }))
      });
      dispatch(clearCartItems());
      return data;
    } catch (error) {
      const message = getErrorMessage(error);
      handleAuthError(message, dispatch);
      return rejectWithValue(message);
    }
  }
);

export const getOrderDetails = createAsyncThunk(
  'orderDetails/fetch',
  async (id: string, { getState, dispatch, rejectWithValue }) => {
    try {
      const { userLogin } = getState() as OrderSliceRootState;
      if (!hasSession(userLogin.userInfo)) throw new Error('Not authenticated');
      const { data } = await axios.get<Order>(`/api/orders/${id}`);
      return data;
    } catch (error) {
      const message = getErrorMessage(error);
      handleAuthError(message, dispatch);
      return rejectWithValue(message);
    }
  }
);

export const payOrder = createAsyncThunk(
  'orderPay/pay',
  async (
    { orderId, paymentResult }: { orderId: string; paymentResult: PaymentResult },
    { getState, dispatch, rejectWithValue }
  ) => {
    try {
      const { userLogin } = getState() as OrderSliceRootState;
      if (!hasSession(userLogin.userInfo)) throw new Error('Not authenticated');
      await axios.put(`/api/orders/${orderId}/pay`, paymentResult);
      return undefined;
    } catch (error) {
      const message = getErrorMessage(error);
      handleAuthError(message, dispatch);
      return rejectWithValue(message);
    }
  }
);

export const deliverOrder = createAsyncThunk(
  'orderDeliver/deliver',
  async (order: Order, { getState, dispatch, rejectWithValue }) => {
    try {
      const { userLogin } = getState() as OrderSliceRootState;
      if (!hasSession(userLogin.userInfo)) throw new Error('Not authenticated');
      await axios.put(`/api/orders/${order._id}/deliver`, {});
      return undefined;
    } catch (error) {
      const message = getErrorMessage(error);
      handleAuthError(message, dispatch);
      return rejectWithValue(message);
    }
  }
);

export const listMyOrder = createAsyncThunk(
  'myOrder/list',
  async (_void: undefined, { getState, dispatch, rejectWithValue }) => {
    try {
      const { userLogin } = getState() as OrderSliceRootState;
      if (!hasSession(userLogin.userInfo)) throw new Error('Not authenticated');
      const { data } = await axios.get<Order[]>('/api/orders/myorders');
      return data;
    } catch (error) {
      const message = getErrorMessage(error);
      handleAuthError(message, dispatch);
      return rejectWithValue(message);
    }
  }
);

export const listOrders = createAsyncThunk(
  'orderList/list',
  async (_void: undefined, { getState, dispatch, rejectWithValue }) => {
    try {
      const { userLogin } = getState() as OrderSliceRootState;
      if (!hasSession(userLogin.userInfo)) throw new Error('Not authenticated');
      const { data } = await axios.get<Order[]>('/api/orders');
      return data;
    } catch (error) {
      const message = getErrorMessage(error);
      handleAuthError(message, dispatch);
      return rejectWithValue(message);
    }
  }
);

const orderCreateSlice = createSlice({
  name: 'orderCreate',
  initialState: {} as OrderMutationState,
  reducers: {
    orderCreateReset: () => ({})
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.order = action.payload;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

const orderDetailsSlice = createSlice({
  name: 'orderDetails',
  initialState: {
    loading: true,
    order: undefined as Order | undefined
  } as OrderMutationState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getOrderDetails.pending, (state) => {
        state.loading = true;
      })
      .addCase(getOrderDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.order = action.payload;
      })
      .addCase(getOrderDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

const orderPaySlice = createSlice({
  name: 'orderPay',
  initialState: {} as OrderMutationState,
  reducers: {
    orderPayReset: () => ({})
  },
  extraReducers: (builder) => {
    builder
      .addCase(payOrder.pending, (state) => {
        state.loading = true;
      })
      .addCase(payOrder.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(payOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

const orderDeliverSlice = createSlice({
  name: 'orderDeliver',
  initialState: {} as OrderMutationState,
  reducers: {
    orderDeliverReset: () => ({})
  },
  extraReducers: (builder) => {
    builder
      .addCase(deliverOrder.pending, (state) => {
        state.loading = true;
      })
      .addCase(deliverOrder.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(deliverOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

const myOrderSlice = createSlice({
  name: 'myOrder',
  initialState: { orders: [] } as OrderListState,
  reducers: {
    myOrderListReset: () => ({ orders: [] })
  },
  extraReducers: (builder) => {
    builder
      .addCase(listMyOrder.pending, (state) => {
        state.loading = true;
      })
      .addCase(listMyOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(listMyOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(logout.pending, () => ({ orders: [] }));
  }
});

const orderListSlice = createSlice({
  name: 'orderList',
  initialState: { orders: [] } as OrderListState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(listOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(listOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(listOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { orderCreateReset } = orderCreateSlice.actions;
export const { orderPayReset } = orderPaySlice.actions;
export const { orderDeliverReset } = orderDeliverSlice.actions;
export const { myOrderListReset } = myOrderSlice.actions;

export const orderCreateReducer = orderCreateSlice.reducer;
export const orderDetailsReducer = orderDetailsSlice.reducer;
export const orderPayReducer = orderPaySlice.reducer;
export const orderDeliverReducer = orderDeliverSlice.reducer;
export const myOrderReducer = myOrderSlice.reducer;
export const orderListReducer = orderListSlice.reducer;
