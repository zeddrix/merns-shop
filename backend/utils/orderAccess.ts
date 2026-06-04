import type { Types } from 'mongoose';
import type { IUserDocument } from '../models/User.js';
import type { IOrderDocument } from '../models/Order.js';

export class OrderAccessError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OrderAccessError';
  }
}

export const isOrderOwner = (order: IOrderDocument, user: IUserDocument): boolean => {
  const orderUserId =
    typeof order.user === 'object' && order.user !== null && '_id' in order.user
      ? String((order.user as { _id: Types.ObjectId })._id)
      : String(order.user);

  return orderUserId === String(user._id);
};

export const assertOrderOwnerOrAdmin = (order: IOrderDocument, user: IUserDocument): void => {
  if (user.isAdmin || isOrderOwner(order, user)) {
    return;
  }

  throw new OrderAccessError('Not authorized to access this order');
};

export const assertOrderOwner = (order: IOrderDocument, user: IUserDocument): void => {
  if (isOrderOwner(order, user)) {
    return;
  }

  throw new OrderAccessError('Not authorized to access this order');
};
