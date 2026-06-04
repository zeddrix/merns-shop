import type { Product } from '../types';

export const defaultProductFields = {
  name: 'New Product',
  image: '/images/sample.jpg',
  brand: 'Admin',
  category: 'Electronics',
  subcategory: 'Phones',
  modelKey: 'new-product-draft',
  releaseYear: new Date().getFullYear(),
  condition: 'Like New',
  description: 'New product — add details and variants.',
  variants: [
    {
      sku: 'new-product-draft-standard',
      label: 'Standard',
      listPrice: 99,
      price: 69,
      countInStock: 0
    }
  ]
};

export const emptyProduct = (): Omit<
  Product,
  '_id' | 'user' | 'reviews' | 'rating' | 'numReviews'
> => defaultProductFields;

export const DEFAULT_NEW_PRODUCT = defaultProductFields;
