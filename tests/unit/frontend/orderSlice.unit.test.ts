import { describe, expect, it } from 'vitest';
import { listOrders, deliverOrder } from '../../../frontend/src/features/orderSlice';

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
