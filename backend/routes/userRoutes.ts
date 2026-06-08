import express from 'express';
import rateLimit from 'express-rate-limit';
import {
  authUser,
  deleteUser,
  getAllUsers,
  getUserById,
  getUserProfile,
  logoutUser,
  registerUser,
  updateUser,
  updateUserProfile
} from '../controllers/userController.js';
import { admin, protect } from '../middleware/authMiddleware.js';
import { validateBody } from '../middleware/validateMiddleware.js';
import {
  loginUserSchema,
  registerUserSchema,
  updateProfileSchema,
  updateUserAdminSchema
} from '../validators/schemas.js';

const router = express.Router();

const isTestEnv = process.env.NODE_ENV === 'test';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: () => Number(process.env.AUTH_RATE_LIMIT_MAX ?? (isTestEnv ? 10_000 : 10)),
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many authentication attempts, please try again later.' }
});

router
  .route('/')
  .post(authLimiter, validateBody(registerUserSchema), registerUser)
  .get(protect, admin, getAllUsers);
router.post('/login', authLimiter, validateBody(loginUserSchema), authUser);
router.post('/logout', logoutUser);
router
  .route('/profile')
  .get(protect, getUserProfile)
  .put(protect, validateBody(updateProfileSchema), updateUserProfile);
router
  .route('/:id')
  .delete(protect, admin, deleteUser)
  .get(protect, admin, getUserById)
  .put(protect, admin, validateBody(updateUserAdminSchema), updateUser);

export default router;
