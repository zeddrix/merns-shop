import { describe, expect, it } from 'vitest';
import {
  registerUserSchema,
  loginUserSchema,
  createOrderSchema
} from '../../../backend/validators/schemas.js';

describe('request validation schemas', () => {
  it('rejects invalid register payload', () => {
    const result = registerUserSchema.safeParse({ name: '', email: 'bad', password: '123' });
    expect(result.success).toBe(false);
  });

  it('accepts valid login payload', () => {
    const result = loginUserSchema.safeParse({
      email: 'john@gmail.com',
      password: '123456'
    });
    expect(result.success).toBe(true);
  });

  it('requires at least one order item', () => {
    const result = createOrderSchema.safeParse({
      orderItems: [],
      shippingAddress: {
        address: '123',
        city: 'City',
        postalCode: '12345',
        country: 'US'
      },
      paymentMethod: 'PayPal',
      itemsPrice: 10,
      taxPrice: 0,
      shippingPrice: 0,
      totalPrice: 10
    });
    expect(result.success).toBe(false);
  });
});
