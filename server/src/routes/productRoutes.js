import { Router } from 'express';
import {
  getProducts,
  getProductBySlug,
  getRelatedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImages,
  getSellerProducts,
} from '../controllers/productController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { uploadMultiple } from '../middleware/upload.js';

const router = Router();

// Public
router.get('/', getProducts);
router.get('/detail/:slug', getProductBySlug);
router.get('/:id/related', getRelatedProducts);

// Seller — own products
router.get('/seller/my-products', authenticate, authorize('SELLER'), getSellerProducts);
router.post('/', authenticate, authorize('SELLER'), createProduct);
router.put('/:id', authenticate, authorize('SELLER'), updateProduct);
router.post('/:id/images', authenticate, authorize('SELLER'), uploadMultiple, uploadProductImages);

// Seller or Admin delete
router.delete('/:id', authenticate, authorize('SELLER', 'ADMIN'), deleteProduct);

export default router;
