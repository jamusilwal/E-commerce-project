import api from './api';

export const categoryService = {
  getCategories: () => api.get('/categories'),
  getCategoryBySlug: (slug) => api.get(`/categories/${slug}`),
};

export const cartService = {
  getCart: () => api.get('/cart'),
  addToCart: (productId, quantity = 1) => api.post('/cart/items', { productId, quantity }),
  updateCartItem: (id, quantity) => api.put(`/cart/items/${id}`, { quantity }),
  removeCartItem: (id) => api.delete(`/cart/items/${id}`),
  clearCart: () => api.delete('/cart'),
};

export const wishlistService = {
  getWishlist: () => api.get('/wishlist'),
  addToWishlist: (productId) => api.post('/wishlist/items', { productId }),
  removeFromWishlist: (productId) => api.delete(`/wishlist/items/${productId}`),
  moveToCart: (productId) => api.post(`/wishlist/move-to-cart/${productId}`),
};

export const orderService = {
  createOrder: (data) => api.post('/orders', data),
  getMyOrders: (params) => api.get('/orders', { params }),
  getOrderById: (id) => api.get(`/orders/${id}`),
  cancelOrder: (id, reason) => api.put(`/orders/${id}/cancel`, { reason }),
};

export const paymentService = {
  initiateEsewa: (orderId) => api.post('/payments/esewa/initiate', { orderId }),
  verifyEsewa: (data) => api.post('/payments/esewa/verify', { data }),
  initiateKhalti: (orderId) => api.post('/payments/khalti/initiate', { orderId }),
  verifyKhalti: (pidx, orderId) => api.post('/payments/khalti/verify', { pidx, orderId }),
};

export const reviewService = {
  getProductReviews: (productId, params) => api.get(`/reviews/product/${productId}`, { params }),
  createReview: (data) => api.post('/reviews', data),
  deleteReview: (id) => api.delete(`/reviews/${id}`),
};

export const addressService = {
  getAddresses: () => api.get('/addresses'),
  createAddress: (data) => api.post('/addresses', data),
  updateAddress: (id, data) => api.put(`/addresses/${id}`, data),
  deleteAddress: (id) => api.delete(`/addresses/${id}`),
};

export const sellerService = {
  registerSeller: (data) => api.post('/seller/register', data),
  getDashboard: () => api.get('/seller/dashboard'),
  getOrders: (params) => api.get('/seller/orders', { params }),
  getAnalytics: () => api.get('/seller/analytics'),
  updateOrderStatus: (id, data) => api.put(`/orders/${id}/status`, data),
};

export const adminService = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params) => api.get('/admin/users', { params }),
  toggleUserActive: (id) => api.put(`/admin/users/${id}/toggle-active`),
  getPendingSellers: () => api.get('/admin/sellers/pending'),
  approveSeller: (id) => api.put(`/admin/sellers/${id}/approve`),
  rejectSeller: (id, reason) => api.put(`/admin/sellers/${id}/reject`, { reason }),
  getAllOrders: (params) => api.get('/admin/orders', { params }),
  getAnalytics: () => api.get('/admin/analytics'),
  getContactMessages: () => api.get('/admin/contact-messages'),
  getBanners: () => api.get('/admin/banners'),
  createBanner: (data) => api.post('/admin/banners', data),
  updateBanner: (id, data) => api.put(`/admin/banners/${id}`, data),
  deleteBanner: (id) => api.delete(`/admin/banners/${id}`),
};

export const notificationService = {
  getNotifications: () => api.get('/notifications'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
};

export const bannerService = {
  getBanners: () => api.get('/banners'),
};

export const contactService = {
  sendMessage: (data) => api.post('/contact', data),
};
