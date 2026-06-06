import { describe, expect, it } from 'vitest';
import {
  listOrders,
  deliverOrder,
  orderListReducer,
  orderCreateReducer,
  createOrder
} from '../../../frontend/src/features/orderSlice';
import type { Order } from '../../../frontend/src/types';

describe('orderSlice action types', () => {
  it('listOrders uses ORDER_LIST prefix without typo', () => {
    expect(listOrders.pending.type).toBe('orderList/list/pending');
    expect(listOrders.fulfilled.type).toBe('orderList/list/fulfilled');
    expect(listOrders.rejected.type).toBe('orderList/list/rejected');
  });

  it('deliverOrder uses ORDER_DELIVER prefix without typo', () => {
    expect(deliverOrder.pending.type).toBe('orderDeliver/deliver/pending');
    expect(deliverOrder.fulfilled.type).toBe('orderDeliver/deliver/fulfilled');
    expect(deliverOrder.rejected.type).toBe('orderDeliver/deliver/rejected');
  });
});

describe('orderSlice reducers', () => {
  it('orderListReducer stores orders on fulfilled', () => {
    const orders = [{ _id: 'order-1' }] as Order[];
    const state = orderListReducer(undefined, {
      type: listOrders.fulfilled.type,
      payload: orders
    });

    expect(state.orders).toEqual(orders);
    expect(state.loading).toBe(false);
    expect(state.error).toBeUndefined();
  });

  it('orderListReducer stores error on rejected', () => {
    const state = orderListReducer(undefined, {
      type: listOrders.rejected.type,
      payload: 'Admin only',
      error: { message: 'Rejected' }
    });

    expect(state.error).toBe('Admin only');
    expect(state.loading).toBe(false);
  });

  it('orderCreateReducer marks success on fulfilled', () => {
    const order = { _id: 'order-2', totalPrice: 99.99 } as Order;
    const state = orderCreateReducer(undefined, {
      type: createOrder.fulfilled.type,
      payload: order
    });

    expect(state.success).toBe(true);
    expect(state.order).toEqual(order);
    expect(state.loading).toBe(false);
  });
});
