import { describe, expect, it } from 'vitest';
import type { ApiProduct, ApiUser } from '../../../types/api';

describe('api contract types', () => {
  it('ApiProduct shape matches sample payload', () => {
    const sample: ApiProduct = {
      _id: '507f1f77bcf86cd799439011',
      name: 'iPhone',
      image: '/images/phone.jpg',
      brand: 'Apple',
      category: 'Electronics',
      description: 'Phone',
      rating: 4.5,
      numReviews: 2,
      price: 999,
      countInStock: 10,
      reviews: [],
      user: '507f1f77bcf86cd799439012'
    };
    expect(sample.name).toBe('iPhone');
    expect(typeof sample.price).toBe('number');
  });

  it('ApiUser shape matches login response', () => {
    const sample: ApiUser = {
      _id: '507f1f77bcf86cd799439011',
      name: 'John',
      email: 'john@gmail.com',
      isAdmin: false,
      token: 'jwt-token'
    };
    expect(sample.token).toBeDefined();
  });
});
