import type { Types } from 'mongoose';
import Order from '../models/Order.js';

export const userCanReviewProduct = async (
  userId: Types.ObjectId | string,
  productId: Types.ObjectId | string
): Promise<boolean> => {
  const order = await Order.findOne({
    user: userId,
    isDelivered: true,
    'orderItems.product': productId
  }).select('_id');

  return Boolean(order);
};
