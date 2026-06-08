/** Fields required for catalog cards, filters, and admin list rows. */
export const PRODUCT_LIST_SELECT =
  '_id name image brand category subcategory modelKey releaseYear condition rating numReviews variants.sku variants.label variants.listPrice variants.price variants.countInStock variants.image';

export const PRODUCT_LIST_PROJECT = {
  _id: 1,
  name: 1,
  image: 1,
  brand: 1,
  category: 1,
  subcategory: 1,
  modelKey: 1,
  releaseYear: 1,
  condition: 1,
  rating: 1,
  numReviews: 1,
  variants: {
    sku: 1,
    label: 1,
    listPrice: 1,
    price: 1,
    countInStock: 1,
    image: 1
  }
} as const;

export type ProductListLean = {
  _id: unknown;
  name: string;
  image: string;
  brand: string;
  category: string;
  subcategory: string;
  modelKey: string;
  releaseYear: number;
  condition: string;
  rating: number;
  numReviews: number;
  variants: Array<{
    sku: string;
    label: string;
    listPrice: number;
    price: number;
    countInStock: number;
    image?: string;
  }>;
};
