import { describe, expect, it } from 'vitest';
import type { ApiOrder, ApiProduct, ApiUser } from '../../../types/api';
import type { Order, Product, UserInfo } from '../../../frontend/src/types/index';

const sharedProductKeys: Array<keyof ApiProduct & keyof Product> = [
  '_id',
  'name',
  'image',
  'brand',
  'category',
  'description',
  'rating',
  'numReviews',
  'price',
  'countInStock',
  'user'
];

describe('api contract types', () => {
  it('ApiProduct aligns with frontend Product keys', () => {
    const apiProduct: ApiProduct = {
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

    const frontendProduct: Product = {
      _id: apiProduct._id,
      name: apiProduct.name,
      image: apiProduct.image,
      brand: apiProduct.brand,
      category: apiProduct.category,
      description: apiProduct.description,
      rating: apiProduct.rating,
      numReviews: apiProduct.numReviews,
      price: apiProduct.price,
      countInStock: apiProduct.countInStock,
      user: apiProduct.user,
      reviews: []
    };

    for (const key of sharedProductKeys) {
      expect(frontendProduct[key]).toEqual(apiProduct[key]);
    }
  });

  it('ApiUser public fields align with frontend UserInfo', () => {
    const apiUser: ApiUser = {
      _id: '507f1f77bcf86cd799439011',
      name: 'John',
      email: 'john@gmail.com',
      isAdmin: false
    };

    const userInfo: UserInfo = {
      _id: apiUser._id,
      name: apiUser.name,
      email: apiUser.email,
      isAdmin: apiUser.isAdmin
    };

    expect(userInfo.email).toBe('john@gmail.com');
    expect('token' in userInfo).toBe(false);
  });

  it('ApiOrder core fields align with frontend Order', () => {
    const apiOrder: ApiOrder = {
      _id: '507f1f77bcf86cd799439011',
      user: '507f1f77bcf86cd799439012',
      orderItems: [],
      shippingAddress: {
        address: '123 St',
        city: 'City',
        postalCode: '12345',
        country: 'US'
      },
      paymentMethod: 'PayPal',
      taxPrice: 10,
      shippingPrice: 0,
      totalPrice: 110,
      isPaid: false,
      isDelivered: false,
      createdAt: new Date().toISOString()
    };

    const frontendOrder: Pick<Order, 'totalPrice' | 'isPaid' | 'isDelivered' | 'paymentMethod'> = {
      totalPrice: apiOrder.totalPrice,
      isPaid: apiOrder.isPaid,
      isDelivered: apiOrder.isDelivered,
      paymentMethod: apiOrder.paymentMethod
    };

    expect(frontendOrder.totalPrice).toBe(110);
  });
});
