import { Router } from 'express';
import {
  initiateEsewa,
  verifyEsewa,
  initiateKhalti,
  verifyKhalti,
} from '../controllers/paymentController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// eSewa endpoints
router.post('/esewa/initiate', authenticate, initiateEsewa);
router.post('/esewa/verify', verifyEsewa); // Public callback endpoint

// Khalti endpoints
router.post('/khalti/initiate', authenticate, initiateKhalti);
router.post('/khalti/verify', verifyKhalti); // Public callback endpoint

export default router;
