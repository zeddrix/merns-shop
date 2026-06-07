import asyncHandler from 'express-async-handler';
import type { Request, Response } from 'express';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { calculateOrderPrices, type ResolvedOrderItem } from '../utils/orderPricing.js';
import {
  getVariantDisplayImage,
  getVariantLineName,
  resolveVariant
} from '../utils/productVariants.js';
import {
  assertOrderOwner,
  assertOrderOwnerOrAdmin,
  OrderAccessError
} from '../utils/orderAccess.js';
import { sendOrderNotification } from '../services/pushService.js';

const resolveOrderItems = async (
  orderItems: Array<{ product: string; qty: number; variantSku: string }>
): Promise<ResolvedOrderItem[]> => {
  const resolved: ResolvedOrderItem[] = [];

  for (const item of orderItems) {
    const product = await Product.findById(item.product);

    if (!product) {
      throw new Error(`Product not found: ${item.product}`);
    }

    const variant = resolveVariant(product, item.variantSku);
    if (!variant) {
      throw new Error(`Invalid variant: ${item.variantSku}`);
    }

    if (variant.countInStock < item.qty) {
      throw new Error(`Insufficient stock for ${product.name} (${variant.label})`);
    }

    resolved.push({
      name: getVariantLineName(product.name, variant),
      qty: item.qty,
      image: getVariantDisplayImage(product, variant),
      price: variant.price,
      product: String(product._id),
      variantSku: variant.sku,
      variantLabel: variant.label
    });
  }

  return resolved;
};

const addOrderItems = asyncHandler(async (req: Request, res: Response) => {
  const { orderItems, shippingAddress, paymentMethod } = req.body;

  if (!req.user) {
    res.status(401);
    throw new Error('Not authorized');
  }

  if (!orderItems || orderItems.length === 0) {
    res.status(400);
    throw new Error('No order items');
  }

  let resolvedItems: ResolvedOrderItem[];
  try {
    resolvedItems = await resolveOrderItems(orderItems);
  } catch (error) {
    res.status(400);
    throw error instanceof Error ? error : new Error('Invalid order items');
  }

  const prices = calculateOrderPrices(resolvedItems);

  const order = new Order({
    orderItems: resolvedItems,
    user: req.user._id,
    shippingAddress,
    paymentMethod,
    taxPrice: prices.taxPrice,
    shippingPrice: prices.shippingPrice,
    totalPrice: prices.totalPrice
  });

  const createdOrder = await order.save();

  res.status(201).json(createdOrder);
});

const getOrderById = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401);
    throw new Error('Not authorized');
  }

  const order = await Order.findById(req.params.id).populate('user', 'name email');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  try {
    assertOrderOwnerOrAdmin(order, req.user);
  } catch (error) {
    if (error instanceof OrderAccessError) {
      res.status(401);
    }
    throw error;
  }

  res.json(order);
});

const updateOrderToPaid = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401);
    throw new Error('Not authorized');
  }

  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  try {
    assertOrderOwner(order, req.user);
  } catch (error) {
    if (error instanceof OrderAccessError) {
      res.status(401);
    }
    throw error;
  }

  if (order.isPaid) {
    res.status(400);
    throw new Error('Order is already paid');
  }

  order.isPaid = true;
  order.paidAt = new Date();
  order.paymentResult = {
    id: req.body.id,
    status: req.body.status,
    update_time: req.body.update_time,
    email_address: req.body.payer.email_address
  };

  const updatedOrder = await order.save();

  await sendOrderNotification({
    userId: order.user,
    orderId: String(order._id),
    type: 'order_paid',
    title: 'Payment confirmed',
    body: `Your order #${String(order._id).slice(-6)} has been paid.`,
    url: `/order/${String(order._id)}`
  });

  res.json(updatedOrder);
});

const updateOrderToDelivered = asyncHandler(async (req: Request, res: Response) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (!order.isPaid) {
    res.status(400);
    throw new Error('Order is not paid');
  }

  if (order.isDelivered) {
    res.status(400);
    throw new Error('Order is already delivered');
  }

  order.isDelivered = true;
  order.deliveredAt = new Date();

  const updatedOrder = await order.save();

  await sendOrderNotification({
    userId: order.user,
    orderId: String(order._id),
    type: 'order_delivered',
    title: 'Order delivered',
    body: `Your order #${String(order._id).slice(-6)} has been delivered.`,
    url: `/order/${String(order._id)}`
  });

  res.json(updatedOrder);
});

const listMyOrders = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401);
    throw new Error('Not authorized');
  }

  const orders = await Order.find({ user: req.user._id });
  res.json(orders);
});

const getOrders = asyncHandler(async (_req: Request, res: Response) => {
  const orders = await Order.find({}).populate('user', 'id name');
  res.json(orders);
});

export {
  addOrderItems,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  listMyOrders,
  getOrders
};
