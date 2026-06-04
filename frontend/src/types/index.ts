export interface Review {
  _id: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: string;
}

export interface Product {
  _id: string;
  name: string;
  image: string;
  brand: string;
  category: string;
  description: string;
  reviews: Review[];
  rating: number;
  numReviews: number;
  price: number;
  countInStock: number;
  user: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem {
  product: string;
  name: string;
  image: string;
  price: number;
  countInStock: number;
  qty: number;
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

export interface ProductListResponse {
  products: Product[];
  page: number;
  pages: number;
}

export interface AsyncState {
  loading?: boolean;
  error?: string;
  success?: boolean;
}
