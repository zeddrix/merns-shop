export interface OrderItemInput {
  product: string;
  qty: number;
  variantSku: string;
}

export interface ResolvedOrderItem {
  name: string;
  qty: number;
  image: string;
  price: number;
  product: string;
  variantSku: string;
  variantLabel: string;
}

export interface OrderPriceBreakdown {
  itemsPrice: number;
  shippingPrice: number;
  taxPrice: number;
  totalPrice: number;
}

const roundMoney = (num: number): number => Math.round(num * 100) / 100;

export const calculateOrderPrices = (orderItems: ResolvedOrderItem[]): OrderPriceBreakdown => {
  const itemsPrice = roundMoney(orderItems.reduce((acc, item) => acc + item.price * item.qty, 0));
  const shippingPrice = roundMoney(itemsPrice > 100 ? 0 : 100);
  const taxPrice = roundMoney(Number((0.15 * itemsPrice).toFixed(2)));
  const totalPrice = roundMoney(itemsPrice + shippingPrice + taxPrice);

  return { itemsPrice, shippingPrice, taxPrice, totalPrice };
};
