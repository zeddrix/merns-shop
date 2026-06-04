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

  it('requires variantSku on order items', () => {
    const result = createOrderSchema.safeParse({
      orderItems: [{ product: '507f1f77bcf86cd799439011', qty: 1 }],
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

  it('rejects duplicate variant skus', () => {
    const result = productInputSchema.safeParse({
      name: 'Sample',
      image: '/images/sample.jpg',
      brand: 'Brand',
      category: 'Electronics',
      subcategory: 'Phones',
      modelKey: 'sample-phone',
      releaseYear: 2024,
      description: 'Description',
      variants: [
        {
          sku: 'dup-sku',
          label: '128GB',
          listPrice: 99,
          price: 69,
          countInStock: 5
        },
        {
          sku: 'dup-sku',
          label: '256GB',
          listPrice: 109,
          price: 79,
          countInStock: 3
        }
      ]
    });
    expect(result.success).toBe(false);
  });

  it('accepts product input with variants', () => {
    const result = productInputSchema.safeParse({
      name: 'Sample',
      image: '/images/sample.jpg',
      brand: 'Brand',
      category: 'Electronics',
      subcategory: 'Phones',
      modelKey: 'sample-phone',
      releaseYear: 2024,
      description: 'Description',
      variants: [
        {
          sku: 'sample-128gb',
          label: '128GB',
          listPrice: 99,
          price: 69,
          countInStock: 5
        }
      ]
    });
    expect(result.success).toBe(true);
  });
});
