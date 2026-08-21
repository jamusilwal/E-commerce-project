import { Router } from 'express';
import {
  getProductReviews,
  createReview,
  deleteReview,
} from '../controllers/reviewController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Public
router.get('/product/:productId', getProductReviews);

// Authenticated
router.post('/', authenticate, createReview);
router.delete('/:id', authenticate, deleteReview);

export default router;
