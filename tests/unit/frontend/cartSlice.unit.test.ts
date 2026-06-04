import { describe, expect, it, beforeEach } from 'vitest';
import cartReducer, {
  removeFromCart,
  saveShippingAddress
} from '../../../frontend/src/features/cartSlice';

describe('cartSlice', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('removes item from cart', () => {
    const initial = {
      cartItems: [
        {
          product: 'abc',
          name: 'Test',
          image: '/img.jpg',
          price: 10,
          countInStock: 5,
          qty: 1
        }
      ],
      shippingAddress: {}
    };

    const state = cartReducer(initial, removeFromCart('abc'));
    expect(state.cartItems).toHaveLength(0);
  });

  it('saves shipping address to state and localStorage', () => {
    const initial = { cartItems: [], shippingAddress: {} };
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
});
