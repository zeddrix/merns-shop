import { describe, expect, it, vi, beforeEach } from 'vitest';

const axiosPost = vi.hoisted(() => vi.fn());
const markCartItemsToPayMock = vi.hoisted(() =>
  vi.fn((payload: { orderId: string; lineKeys: string[] }) => ({
    type: 'cart/markCartItemsToPay',
    payload
  }))
);

vi.mock('../../../frontend/src/api/http', () => ({
  axios: { post: axiosPost }
}));

vi.mock('../../../frontend/src/utils/requireSession', () => ({
  hasSession: () => true
}));

vi.mock('../../../frontend/src/features/cartSlice', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../../frontend/src/features/cartSlice')>();
  return {
    ...actual,
    markCartItemsToPay: markCartItemsToPayMock,
    clearCartItemsForOrder: vi.fn(() => ({ type: 'cart/clearCartItemsForOrder' }))
  };
});

import { createOrder } from '../../../frontend/src/features/orderSlice';

describe('createOrder thunk', () => {
  beforeEach(() => {
    axiosPost.mockReset();
    markCartItemsToPayMock.mockClear();
  });

  it('marks_cart_items_to_pay_instead_of_clearing_on_success', async () => {
    axiosPost.mockResolvedValueOnce({
      data: { _id: 'order-abc', totalPrice: 99.99 }
    });

    const dispatch = vi.fn();
    const getState = vi.fn(() => ({
      userLogin: { userInfo: { _id: 'user-1', name: 'Test', email: 't@e.com', isAdmin: false } }
    }));

    const orderPayload = {
      orderItems: [
        {
          product: 'prod-1',
          name: 'Phone',
          image: '/img.jpg',
          price: 99.99,
          qty: 1,
          variantSku: 'phone-128gb',
          variantLabel: '128GB'
        }
      ],
      shippingAddress: {
        address: '123 St',
        city: 'City',
        postalCode: '12345',
        country: 'US'
      },
      paymentMethod: 'PayPal',
      itemsPrice: '99.99',
      shippingPrice: '0.00',
      taxPrice: '0.00',
      totalPrice: '99.99'
    };

    const thunk = createOrder(orderPayload);
    const result = await thunk(dispatch, getState, undefined);

    expect(result.payload).toEqual({ _id: 'order-abc', totalPrice: 99.99 });
    expect(markCartItemsToPayMock).toHaveBeenCalledWith({
      orderId: 'order-abc',
      lineKeys: ['prod-1:phone-128gb']
    });
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'cart/markCartItemsToPay',
        payload: { orderId: 'order-abc', lineKeys: ['prod-1:phone-128gb'] }
      })
    );
  });
});
