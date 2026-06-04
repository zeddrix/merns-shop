import express from 'express';
import {
  addOrderItems,
  listMyOrders,
  getOrderById,
  getOrders,
  updateOrderToPaid,
  updateOrderToDelivered
} from '../controllers/orderController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { validateBody } from '../middleware/validateMiddleware.js';
import { createOrderSchema, payOrderSchema } from '../validators/schemas.js';

const router = express.Router();

router
  .route('/')
  .post(protect, validateBody(createOrderSchema), addOrderItems)
  .get(protect, admin, getOrders);
router.route('/myorders').get(protect, listMyOrders);
router.route('/:id').get(protect, getOrderById);
router.route('/:id/pay').put(protect, validateBody(payOrderSchema), updateOrderToPaid);
router.route('/:id/deliver').put(protect, admin, updateOrderToDelivered);

export default router;
