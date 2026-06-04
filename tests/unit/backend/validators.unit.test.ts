import { describe, expect, it } from 'vitest';
import {
  registerUserSchema,
  loginUserSchema,
  createOrderSchema,
  payOrderSchema,
  updateUserAdminSchema,
  productInputSchema
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
      paymentMethod: 'PayPal'
    });
    expect(result.success).toBe(false);
  });

  it('rejects pay payload without payer email', () => {
    const result = payOrderSchema.safeParse({
      id: 'payment-id',
      status: 'COMPLETED',
      update_time: new Date().toISOString()
    });
    expect(result.success).toBe(false);
  });

  it('accepts admin user update payload', () => {
    const result = updateUserAdminSchema.safeParse({
      name: 'Updated',
      email: 'admin@gmail.com',
      isAdmin: true
    });
    expect(result.success).toBe(true);
  });

  it('accepts product input payload', () => {
    const result = productInputSchema.safeParse({
      name: 'Sample',
      price: 99,
      image: '/images/sample.jpg',
      brand: 'Brand',
      category: 'Category',
      description: 'Description',
      countInStock: 5
    });
    expect(result.success).toBe(true);
  });
});
