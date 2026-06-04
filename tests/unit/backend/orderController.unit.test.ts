import { describe, expect, it } from 'vitest';
import {
  assertOrderOwner,
  assertOrderOwnerOrAdmin,
  isOrderOwner,
  OrderAccessError
} from '../../../backend/utils/orderAccess.js';
import type { IOrderDocument } from '../../../backend/models/Order.js';
import type { IUserDocument } from '../../../backend/models/User.js';
import type { Types } from 'mongoose';

const makeUser = (id: string, isAdmin = false): IUserDocument =>
  ({ _id: id, isAdmin }) as unknown as IUserDocument;

const makeOrder = (userId: string | Types.ObjectId): IOrderDocument =>
  ({ user: userId }) as IOrderDocument;

describe('orderAccess', () => {
  it('detects order owner', () => {
    const user = makeUser('user-1');
    const order = makeOrder('user-1');
    expect(isOrderOwner(order, user)).toBe(true);
  });

  it('allows admin to access any order', () => {
    const admin = makeUser('admin-1', true);
    const order = makeOrder('user-2');
    expect(() => assertOrderOwnerOrAdmin(order, admin)).not.toThrow();
  });

  it('rejects non-owner non-admin access', () => {
    const user = makeUser('user-1');
    const order = makeOrder('user-2');
    expect(() => assertOrderOwnerOrAdmin(order, user)).toThrow(OrderAccessError);
    expect(() => assertOrderOwner(order, user)).toThrow(OrderAccessError);
  });
});
