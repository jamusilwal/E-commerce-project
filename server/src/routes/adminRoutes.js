import { Router } from 'express';
import {
  getAdminDashboard,
  getUsers,
  toggleUserActive,
  getPendingSellers,
  approveSeller,
  rejectSeller,
  getAllOrders,
  getAdminAnalytics,
  getContactMessages,
  getBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../controllers/adminController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// All admin routes require ADMIN role
router.use(authenticate, authorize('ADMIN'));

// Dashboard
router.get('/dashboard', getAdminDashboard);

// Users
router.get('/users', getUsers);
router.put('/users/:id/toggle-active', toggleUserActive);

// Sellers
router.get('/sellers/pending', getPendingSellers);
router.put('/sellers/:id/approve', approveSeller);
router.put('/sellers/:id/reject', rejectSeller);

// Orders
router.get('/orders', getAllOrders);

// Analytics
router.get('/analytics', getAdminAnalytics);

// Contact Messages
router.get('/contact-messages', getContactMessages);

// Banners
router.get('/banners', getBanners);
router.post('/banners', createBanner);
router.put('/banners/:id', updateBanner);
router.delete('/banners/:id', deleteBanner);

// Notifications (shared)
router.get('/notifications', getNotifications);
router.put('/notifications/:id/read', markNotificationRead);
router.put('/notifications/read-all', markAllNotificationsRead);

export default router;
