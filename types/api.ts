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

export interface ApiProduct {
  _id: string;
  name: string;
  image: string;
  brand: string;
  category: string;
  description: string;
  rating: number;
  numReviews: number;
  price: number;
  countInStock: number;
  reviews: ApiReview[];
  user: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiOrderItem {
  name: string;
  qty: number;
  image: string;
  price: number;
  product: string;
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
