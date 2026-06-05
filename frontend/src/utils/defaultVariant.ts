import type { ProductVariant } from '../types';

export const firstInStockSku = (variants: ProductVariant[]): string => {
  const inStock = variants.find((v) => v.countInStock > 0);
  return inStock?.sku ?? '';
};
