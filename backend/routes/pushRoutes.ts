import express from 'express';
import {
  getPublicKey,
  subscribe,
  unsubscribe,
  getPreferences,
  updatePreferences,
  listNotifications,
  markNotificationRead
} from '../controllers/pushController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/vapid-public-key', getPublicKey);
router.post('/subscribe', protect, subscribe);
router.post('/unsubscribe', protect, unsubscribe);
router.route('/preferences').get(protect, getPreferences).put(protect, updatePreferences);
router.get('/notifications', protect, listNotifications);
router.put('/notifications/:id/read', protect, markNotificationRead);

export default router;
