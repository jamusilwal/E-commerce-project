import { Router } from 'express';
import {
  registerSeller,
  getSellerDashboard,
  getSellerOrders,
  getSellerAnalytics,
} from '../controllers/sellerController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// Register as seller (any authenticated user)
router.post('/register', authenticate, registerSeller);

// Seller-only routes
router.get('/dashboard', authenticate, authorize('SELLER'), getSellerDashboard);
router.get('/orders', authenticate, authorize('SELLER'), getSellerOrders);
router.get('/analytics', authenticate, authorize('SELLER'), getSellerAnalytics);

export default router;
