import api from './api';

export const adminService = {
  // Dashboard & Metrics
  getDashboard: () => api.get('/admin/dashboard'),
  getAnalytics: () => api.get('/admin/analytics'),

  // Products
  getProducts: (params) => api.get('/admin/products', { params }),

  // Categories
  getCategories: () => api.get('/categories'),
  createCategory: (data) => api.post('/admin/categories', data),
  updateCategory: (id, data) => api.put(`/admin/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/admin/categories/${id}`),

  // Users Management
  getUsers: (params) => api.get('/admin/users', { params }),
  toggleUserActive: (id) => api.put(`/admin/users/${id}/toggle-active`),

  // Artisans / Sellers Approval
  getPendingSellers: () => api.get('/admin/sellers/pending'),
  approveSeller: (id) => api.put(`/admin/sellers/${id}/approve`),
  rejectSeller: (id, reason) => api.put(`/admin/sellers/${id}/reject`, { reason }),

  // Orders
  getAllOrders: (params) => api.get('/admin/orders', { params }),
  getOrderById: (id) => api.get(`/orders/${id}`),
  updateOrderStatus: (id, data) => api.put(`/orders/${id}/status`, data),
  downloadBill: (id) => api.get(`/orders/${id}/bill`, { responseType: 'blob' }),

  // Payments
  getAllPayments: (params) => api.get('/admin/payments', { params }),

  // Contact messages
  getContactMessages: () => api.get('/admin/contact-messages'),

  // Banners
  getBanners: () => api.get('/admin/banners'),
  createBanner: (data) => api.post('/admin/banners', data),
  updateBanner: (id, data) => api.put(`/admin/banners/${id}`, data),
  deleteBanner: (id) => api.delete(`/admin/banners/${id}`),

  // Notifications
  getNotifications: () => api.get('/admin/notifications'),
  markNotificationRead: (id) => api.put(`/admin/notifications/${id}/read`),
  markAllNotificationsRead: () => api.put('/admin/notifications/read-all'),
};

export const authService = {
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
};

export default adminService;
