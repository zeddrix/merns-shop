import type { Types } from 'mongoose';
import Order from '../models/Order.js';

interface SeedOrderUser {
  _id: Types.ObjectId;
  email: string;
}

interface SeedOrderProduct {
  _id: Types.ObjectId;
  modelKey: string;
  name: string;
  image: string;
  variants: Array<{
    sku: string;
    label: string;
    price: number;
    countInStock: number;
    image?: string;
  }>;
}

/** Products John can review in E2E (delivered orders). */
export const E2E_REVIEW_PRODUCT_MODEL_KEYS = ['iphone-15-pro', 'ipad-air-m2'] as const;

const buildOrderItem = (product: SeedOrderProduct, variantIndex = 0) => {
  const variant = product.variants[variantIndex] ?? product.variants[0];
  return {
    name: `${product.name} (${variant.label})`,
    qty: 1,
    image: variant.image ?? product.image,
    price: variant.price,
    product: product._id,
    variantSku: variant.sku,
    variantLabel: variant.label
  };
};

export const insertSeedOrders = async (
  users: SeedOrderUser[],
  products: SeedOrderProduct[]
): Promise<void> => {
  const john = users.find((u) => u.email === 'john@gmail.com');
  const jane = users.find((u) => u.email === 'jane@gmail.com');
  if (!john || !jane) {
    return;
  }

  const byModelKey = new Map(products.map((p) => [p.modelKey, p]));
  const reviewTargets = E2E_REVIEW_PRODUCT_MODEL_KEYS.map((key) => byModelKey.get(key)).filter(
    (p): p is SeedOrderProduct => Boolean(p)
  );

  const firstInStock = products.find((p) => p.variants.some((v) => v.countInStock > 0));
  const orders: Array<{
    user: Types.ObjectId;
    orderItems: ReturnType<typeof buildOrderItem>[];
    shippingAddress: {
      address: string;
      city: string;
      postalCode: string;
      country: string;
    };
    paymentMethod: string;
    taxPrice: number;
    shippingPrice: number;
    totalPrice: number;
    isPaid: boolean;
    paidAt: Date;
    isDelivered: boolean;
    deliveredAt?: Date;
  }> = [];

  const baseAddress = {
    address: '123 Seed Street',
    city: 'San Francisco',
    postalCode: '94102',
    country: 'United States'
  };

  for (const product of reviewTargets) {
    const item = buildOrderItem(product);
    orders.push({
      user: john._id,
      orderItems: [item],
      shippingAddress: baseAddress,
      paymentMethod: 'PayPal',
      taxPrice: 0,
      shippingPrice: 0,
      totalPrice: item.price,
      isPaid: true,
      paidAt: new Date(),
      isDelivered: true,
      deliveredAt: new Date()
    });
  }

  if (firstInStock && !reviewTargets.some((p) => p._id.equals(firstInStock._id))) {
    const item = buildOrderItem(firstInStock);
    orders.push({
      user: john._id,
      orderItems: [item],
      shippingAddress: baseAddress,
      paymentMethod: 'PayPal',
      taxPrice: 0,
      shippingPrice: 0,
      totalPrice: item.price,
      isPaid: true,
      paidAt: new Date(),
      isDelivered: true,
      deliveredAt: new Date()
    });
  }

  const janeProduct = products.find((p) => p.modelKey === 'iphone-14');
  if (janeProduct) {
    const item = buildOrderItem(janeProduct);
    orders.push({
      user: jane._id,
      orderItems: [item],
      shippingAddress: baseAddress,
      paymentMethod: 'PayPal',
      taxPrice: 0,
      shippingPrice: 0,
      totalPrice: item.price,
      isPaid: true,
      paidAt: new Date(),
      isDelivered: false
    });
  }

  if (orders.length > 0) {
    await Order.insertMany(orders);
  }
};
