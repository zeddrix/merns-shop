import { describe, expect, it, beforeEach, vi } from 'vitest';

const axiosGet = vi.hoisted(() => vi.fn());

vi.mock('axios', () => ({
  default: {
    get: axiosGet
  }
}));

import cartReducer, {
  removeFromCart,
  saveShippingAddress,
  rehydrateCart,
  addToCart,
  cartLineKey,
  markCartItemsToPay,
  clearCartItemsForOrder
} from '../../../frontend/src/features/cartSlice';

describe('cartSlice', () => {
  beforeEach(() => {
    localStorage.clear();
    axiosGet.mockReset();
  });

  it('removes item from cart', () => {
    const initial = {
      cartItems: [
        {
          product: 'abc',
          variantSku: 'abc-128gb',
          variantLabel: '128GB',
          name: 'Test (128GB)',
          image: '/img.jpg',
          price: 10,
          countInStock: 5,
          qty: 1
        }
      ],
      shippingAddress: {},
      staleItemsPruned: false,
      rehydrating: false
    };

    const state = cartReducer(
      initial,
      removeFromCart(`${initial.cartItems[0]!.product}:${initial.cartItems[0]!.variantSku}`)
    );
    expect(state.cartItems).toHaveLength(0);
  });

  it('rehydrateCart_removes_items_whose_product_returns_404', async () => {
    axiosGet.mockRejectedValueOnce(new Error('Not found'));

    const dispatch = vi.fn();
    const getState = vi.fn(() => ({
      cart: {
        cartItems: [
          {
            product: 'dead-product-id',
            variantSku: 'dead-128gb',
            variantLabel: '128GB',
            name: 'Dead (128GB)',
            image: '/img.jpg',
            price: 10,
            countInStock: 5,
            qty: 1
          }
        ]
      }
    }));

    const thunk = rehydrateCart();
    const result = await thunk(dispatch, getState, undefined);

    expect(result.payload).toEqual({ cartItems: [], pruned: true });
  });

  it('rehydrateCart_skips_api_validation_when_offline', async () => {
    const cartItem = {
      product: 'offline-product-id',
      variantSku: 'offline-128gb',
      variantLabel: '128GB',
      name: 'Offline (128GB)',
      image: '/img.jpg',
      price: 10,
      countInStock: 5,
      qty: 1
    };

    vi.stubGlobal('navigator', { onLine: false });

    const dispatch = vi.fn();
    const getState = vi.fn(() => ({
      cart: { cartItems: [cartItem] }
    }));

    const thunk = rehydrateCart();
    const result = await thunk(dispatch, getState, undefined);

    expect(axiosGet).not.toHaveBeenCalled();
    expect(result.payload).toEqual({ cartItems: [cartItem], pruned: false });

    vi.unstubAllGlobals();
  });

  it('rehydrateCart_keeps_valid_items', () => {
    const validItem = {
      product: 'live-product-id',
      variantSku: 'live-128gb',
      variantLabel: '128GB',
      name: 'Live (128GB)',
      image: '/img.jpg',
      price: 10,
      countInStock: 5,
      qty: 1
    };
    const initial = {
      cartItems: [],
      shippingAddress: {},
      staleItemsPruned: false,
      rehydrating: false
    };

    const state = cartReducer(initial, {
      type: rehydrateCart.fulfilled.type,
      payload: { cartItems: [validItem], pruned: false }
    });

    expect(state.cartItems).toEqual([validItem]);
    expect(state.staleItemsPruned).toBe(false);
    expect(JSON.parse(localStorage.getItem('cartItems') ?? '[]')).toEqual([validItem]);
  });

  it('saves shipping address to state and localStorage', () => {
    const initial = {
      cartItems: [],
      shippingAddress: {},
      staleItemsPruned: false,
      rehydrating: false
    };
    const address = {
      address: '123 St',
      city: 'City',
      postalCode: '12345',
      country: 'US'
    };

    const state = cartReducer(initial, saveShippingAddress(address));
    expect(state.shippingAddress).toEqual(address);
    expect(JSON.parse(localStorage.getItem('shippingAddress') ?? '{}')).toEqual(address);
  });

  it('rehydrates_paymentMethod_from_localStorage_on_init', async () => {
    localStorage.setItem('paymentMethod', JSON.stringify('PayPal'));
    vi.resetModules();
    const { default: freshCartReducer } = await import('../../../frontend/src/features/cartSlice');
    const state = freshCartReducer(undefined, { type: '@@INIT' });
    expect(state.paymentMethod).toBe('PayPal');
  });

  it('markCartItemsToPay_sets_orderId_on_matching_shopping_items', () => {
    const cartItem = {
      product: 'abc',
      variantSku: 'abc-128gb',
      variantLabel: '128GB',
      name: 'Test (128GB)',
      image: '/img.jpg',
      price: 10,
      countInStock: 5,
      qty: 1
    };
    const initial = {
      cartItems: [cartItem],
      shippingAddress: {},
      staleItemsPruned: false,
      rehydrating: false
    };

    const state = cartReducer(
      initial,
      markCartItemsToPay({ orderId: 'order-1', lineKeys: [cartLineKey('abc', 'abc-128gb')] })
    );
    expect(state.cartItems[0]?.orderId).toBe('order-1');
    expect(JSON.parse(localStorage.getItem('cartItems') ?? '[]')[0]?.orderId).toBe('order-1');
  });

  it('clearCartItemsForOrder_removes_only_matching_lines', () => {
    const initial = {
      cartItems: [
        {
          product: 'abc',
          variantSku: 'abc-128gb',
          variantLabel: '128GB',
          name: 'Test (128GB)',
          image: '/img.jpg',
          price: 10,
          countInStock: 5,
          qty: 1,
          orderId: 'order-1'
        },
        {
          product: 'def',
          variantSku: 'def-256gb',
          variantLabel: '256GB',
          name: 'Other (256GB)',
          image: '/img.jpg',
          price: 20,
          countInStock: 5,
          qty: 1
        }
      ],
      shippingAddress: {},
      staleItemsPruned: false,
      rehydrating: false
    };

    const state = cartReducer(initial, clearCartItemsForOrder('order-1'));
    expect(state.cartItems).toHaveLength(1);
    expect(state.cartItems[0]?.product).toBe('def');
  });

  it('addToCart_rejected_leaves_cart_items_unchanged', () => {
    const initial = {
      cartItems: [
        {
          product: 'abc',
          variantSku: 'abc-128gb',
          variantLabel: '128GB',
          name: 'Test (128GB)',
          image: '/img.jpg',
          price: 10,
          countInStock: 5,
          qty: 1
        }
      ],
      shippingAddress: {},
      staleItemsPruned: false,
      rehydrating: false
    };

    const state = cartReducer(initial, {
      type: addToCart.rejected.type,
      payload: 'Network error',
      error: { message: 'Rejected' }
    });

    expect(state.cartItems).toEqual(initial.cartItems);
  });
});
