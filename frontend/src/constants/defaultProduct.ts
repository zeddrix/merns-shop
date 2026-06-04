/** Payload for POST /api/products — matches backend sample product defaults. */
export const DEFAULT_NEW_PRODUCT = {
  name: 'Sample name',
  price: 0,
  image: '/images/sample.jpg',
  brand: 'Sample brand',
  category: 'Sample category',
  description: 'Sample description',
  countInStock: 0
} as const;
