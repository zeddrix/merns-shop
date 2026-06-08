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
  cartLineKey
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
      staleItemsPruned: false
    };

    const state = cartReducer(initial, removeFromCart(cartLineKey('abc', 'abc-128gb')));
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
    const initial = { cartItems: [], shippingAddress: {}, staleItemsPruned: false };

    const state = cartReducer(initial, {
      type: rehydrateCart.fulfilled.type,
      payload: { cartItems: [validItem], pruned: false }
    });

    expect(state.cartItems).toEqual([validItem]);
    expect(state.staleItemsPruned).toBe(false);
    expect(JSON.parse(localStorage.getItem('cartItems') ?? '[]')).toEqual([validItem]);
  });

  it('saves shipping address to state and localStorage', () => {
    const initial = { cartItems: [], shippingAddress: {}, staleItemsPruned: false };
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
      staleItemsPruned: false
    };

    const state = cartReducer(initial, {
      type: addToCart.rejected.type,
      payload: 'Network error',
      error: { message: 'Rejected' }
    });

    expect(state.cartItems).toEqual(initial.cartItems);
  });
});
