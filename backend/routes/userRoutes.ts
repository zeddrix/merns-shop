import express from 'express';
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

router
  .route('/')
  .post(validateBody(registerUserSchema), registerUser)
  .get(protect, admin, getAllUsers);
router.post('/login', validateBody(loginUserSchema), authUser);
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
