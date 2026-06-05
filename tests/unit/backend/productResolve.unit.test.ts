import { describe, expect, it, vi, beforeEach } from 'vitest';
import Product from '../../../backend/models/Product.js';
import {
  findProductByIdOrModelKey,
  isObjectIdString
} from '../../../backend/utils/productResolve.js';

vi.mock('../../../backend/models/Product.js', () => ({
  default: {
    findById: vi.fn(),
    findOne: vi.fn()
  }
}));

describe('productResolve', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('finds_product_by_object_id', async () => {
    const product = { _id: '64a1f2b3c4d5e6f7a8b9c0d1', modelKey: 'iphone-15-pro' };
    vi.mocked(Product.findById).mockResolvedValue(product as never);

    const result = await findProductByIdOrModelKey('64a1f2b3c4d5e6f7a8b9c0d1');

    expect(Product.findById).toHaveBeenCalledWith('64a1f2b3c4d5e6f7a8b9c0d1');
    expect(result).toBe(product);
  });

  it('finds_product_by_model_key_when_not_object_id', async () => {
    vi.mocked(Product.findById).mockResolvedValue(null);
    const product = { _id: '64a1f2b3c4d5e6f7a8b9c0d2', modelKey: 'iphone-15-pro' };
    vi.mocked(Product.findOne).mockResolvedValue(product as never);

    const result = await findProductByIdOrModelKey('iphone-15-pro');

    expect(Product.findOne).toHaveBeenCalledWith({ modelKey: 'iphone-15-pro' });
    expect(result).toBe(product);
  });

  it('returns_null_for_unknown_id_and_model_key', async () => {
    vi.mocked(Product.findById).mockResolvedValue(null);
    vi.mocked(Product.findOne).mockResolvedValue(null);

    const result = await findProductByIdOrModelKey('000000000000000000000000');

    expect(result).toBeNull();
  });

  it('detects_object_id_strings', () => {
    expect(isObjectIdString('64a1f2b3c4d5e6f7a8b9c0d1')).toBe(true);
    expect(isObjectIdString('iphone-15-pro')).toBe(false);
  });
});
