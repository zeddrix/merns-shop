import express from 'express';
import {
  createProduct,
  createProductReview,
  deleteProduct,
  getProductById,
  getProducts,
  getTopProducts,
  updateProduct
} from '../controllers/productController.js';
import { admin, protect } from '../middleware/authMiddleware.js';
import { validateBody } from '../middleware/validateMiddleware.js';
import { productReviewSchema, productInputSchema } from '../validators/schemas.js';

const router = express.Router();

router
  .route('/')
  .get(getProducts)
  .post(protect, admin, validateBody(productInputSchema), createProduct);
router.get('/top', getTopProducts);
router.route('/:id/reviews').post(protect, validateBody(productReviewSchema), createProductReview);
router
  .route('/:id')
  .get(getProductById)
  .delete(protect, admin, deleteProduct)
  .put(protect, admin, validateBody(productInputSchema), updateProduct);

export default router;
