import { describe, expect, it } from 'vitest';
import { calculateOrderPrices } from '../../../backend/utils/orderPricing.js';

describe('orderPricing', () => {
  it('calculates shipping tax and total for items under 100', () => {
    const prices = calculateOrderPrices([
      { name: 'Phone', qty: 1, image: '/images/phone.jpg', price: 89.99, product: 'p1' }
    ]);

    expect(prices.itemsPrice).toBe(89.99);
    expect(prices.shippingPrice).toBe(100);
    expect(prices.taxPrice).toBe(13.5);
    expect(prices.totalPrice).toBe(203.49);
  });

  it('waives shipping when items exceed 100', () => {
    const prices = calculateOrderPrices([
      { name: 'Phone', qty: 1, image: '/images/phone.jpg', price: 599.99, product: 'p1' }
    ]);

    expect(prices.itemsPrice).toBe(599.99);
    expect(prices.shippingPrice).toBe(0);
    expect(prices.taxPrice).toBe(90);
    expect(prices.totalPrice).toBe(689.99);
  });
});
