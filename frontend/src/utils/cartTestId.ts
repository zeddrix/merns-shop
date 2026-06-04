/** Stable cart line test id suffix (product + variant). */
export function cartLineTestId(productId: string, variantSku: string): string {
  return `${productId}__${variantSku}`;
}
