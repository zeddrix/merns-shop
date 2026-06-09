export interface Review {
  _id: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: string;
}

export interface ProductVariant {
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

export interface Product {
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
  reviews: Review[];
  rating: number;
  numReviews: number;
  variants: ProductVariant[];
  user: string;
  createdAt?: string;
  updatedAt?: string;
  priceFrom?: number;
  listPriceFrom?: number;
  savingsPercentMax?: number;
  inStock?: boolean;
  totalStock?: number;
  canReview?: boolean;
  hasReviewed?: boolean;
}

export interface CartItem {
  product: string;
  variantSku: string;
  variantLabel: string;
  name: string;
  image: string;
  price: number;
  countInStock: number;
  qty: number;
  /** Set when item was submitted in an unpaid order — cleared after payment. */
  orderId?: string;
}

export interface ShippingAddress {
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
}

export interface UserInfo {
  _id: string;
  name: string;
  email: string;
  isAdmin: boolean;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  isAdmin: boolean;
}

export interface OrderItem {
  _id?: string;
  name: string;
  qty: number;
  image: string;
  price: number;
  product: string;
  variantSku: string;
  variantLabel: string;
}

export interface PaymentResult {
  id: string;
  status: string;
  update_time: string;
  payer: {
    email_address: string;
  };
}

export interface Order {
  _id: string;
  user: User;
  orderItems: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  itemsPrice: number;
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;
  isPaid: boolean;
  paidAt?: string;
  isDelivered: boolean;
  deliveredAt?: string;
  createdAt: string;
  paymentResult?: PaymentResult;
}

export interface PaginatedOrdersResponse {
  orders: Order[];
  page: number;
  pages: number;
  total: number;
}

export interface ProductListResponse {
  products: Product[];
  page: number;
  pages: number;
}

export interface ProductMetaResponse {
  brands: string[];
  categories: string[];
  subcategories: string[];
}

export interface AsyncState {
  loading?: boolean;
  error?: string;
  success?: boolean;
}
