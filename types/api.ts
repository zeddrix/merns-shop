export interface ApiUser {
  _id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  token?: string;
}

export interface ApiReview {
  _id: string;
  name: string;
  rating: number;
  comment: string;
  user: string;
  createdAt: string;
}

export interface ApiProductVariant {
  sku: string;
  label: string;
  storageGb?: number;
  screenInches?: number;
  ramGb?: number;
  listPrice: number;
  price: number;
  countInStock: number;
  image?: string;
}

export interface ApiProduct {
  _id: string;
  name: string;
  image: string;
  brand: string;
  category: string;
  subcategory: string;
  modelKey: string;
  releaseYear: number;
  condition: string;
  description: string;
  rating: number;
  numReviews: number;
  variants: ApiProductVariant[];
  reviews: ApiReview[];
  user: string;
  createdAt?: string;
  updatedAt?: string;
  priceFrom?: number;
  listPriceFrom?: number;
  savingsPercentMax?: number;
  inStock?: boolean;
  totalStock?: number;
}

export interface ApiOrderItem {
  name: string;
  qty: number;
  image: string;
  price: number;
  product: string;
  variantSku: string;
  variantLabel: string;
}

export interface ApiShippingAddress {
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface ApiOrder {
  _id: string;
  user: string | ApiUser;
  orderItems: ApiOrderItem[];
  shippingAddress: ApiShippingAddress;
  paymentMethod: string;
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;
  isPaid: boolean;
  paidAt?: string;
  isDelivered: boolean;
  deliveredAt?: string;
  createdAt: string;
}

export interface ApiErrorResponse {
  message: string;
}

export interface PaginatedProductsResponse {
  products: ApiProduct[];
  page: number;
  pages: number;
}

export interface ProductMetaResponse {
  brands: string[];
  categories: string[];
  subcategories: string[];
}
