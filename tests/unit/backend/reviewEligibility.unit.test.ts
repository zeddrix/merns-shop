import { describe, expect, it, vi, beforeEach } from 'vitest';
import Order from '../../../backend/models/Order.js';
import { userCanReviewProduct } from '../../../backend/utils/reviewEligibility.js';

vi.mock('../../../backend/models/Order.js', () => ({
  default: {
    findOne: vi.fn()
  }
}));

describe('userCanReviewProduct', () => {
  beforeEach(() => {
    vi.mocked(Order.findOne).mockReset();
  });

  it('returns_true_when_delivered_order_exists', async () => {
    vi.mocked(Order.findOne).mockReturnValue({
      select: vi.fn().mockResolvedValue({ _id: 'order-1' })
    } as never);

    const result = await userCanReviewProduct('user-1', 'product-1');
    expect(result).toBe(true);
    expect(Order.findOne).toHaveBeenCalledWith({
      user: 'user-1',
      isDelivered: true,
      'orderItems.product': 'product-1'
    });
  });

  it('returns_false_when_no_delivered_order', async () => {
    vi.mocked(Order.findOne).mockReturnValue({
      select: vi.fn().mockResolvedValue(null)
    } as never);

    expect(await userCanReviewProduct('user-1', 'product-1')).toBe(false);
  });
});
