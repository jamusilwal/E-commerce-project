import prisma from '../config/db.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * Admin Controller — platform management
 */

// GET /api/admin/dashboard
export const getAdminDashboard = asyncHandler(async (req, res) => {
  const [
    totalCustomers,
    totalSellers,
    pendingSellers,
    totalProducts,
    totalOrders,
    pendingOrders,
    deliveredOrders,
    revenue,
    recentOrders,
  ] = await Promise.all([
    prisma.user.count({ where: { role: 'CUSTOMER' } }),
    prisma.sellerProfile.count({ where: { status: 'APPROVED' } }),
    prisma.sellerProfile.count({ where: { status: 'PENDING' } }),
    prisma.product.count(),
    prisma.order.count(),
    prisma.order.count({ where: { status: 'PENDING' } }),
    prisma.order.count({ where: { status: 'DELIVERED' } }),
    prisma.payment.aggregate({
      where: { status: 'COMPLETED' },
      _sum: { amount: true },
    }),
    prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { firstName: true, lastName: true } },
        payment: { select: { method: true, status: true } },
      },
    }),
  ]);

  return ApiResponse.ok(res, 'Admin dashboard', {
    stats: {
      totalCustomers,
      totalSellers,
      pendingSellers,
      totalProducts,
      totalOrders,
      pendingOrders,
      deliveredOrders,
      revenue: revenue._sum.amount || 0,
    },
    recentOrders,
  });
});

// GET /api/admin/users
export const getUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, role, search } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const where = {};
  if (role) where.role = role;
  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        lastLogin: true,
        sellerProfile: { select: { shopName: true, status: true } },
        _count: { select: { orders: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return ApiResponse.ok(res, 'Users fetched', {
    users,
    pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
  });
});

// PUT /api/admin/users/:id/toggle-active
export const toggleUserActive = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!user) throw ApiError.notFound('User not found');

  await prisma.user.update({
    where: { id: req.params.id },
    data: { isActive: !user.isActive },
  });

  return ApiResponse.ok(res, `User ${user.isActive ? 'deactivated' : 'activated'}`);
});

// GET /api/admin/sellers/pending
export const getPendingSellers = asyncHandler(async (req, res) => {
  const sellers = await prisma.sellerProfile.findMany({
    where: { status: 'PENDING' },
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { firstName: true, lastName: true, email: true, phone: true, createdAt: true } },
    },
  });

  return ApiResponse.ok(res, 'Pending sellers fetched', sellers);
});

// PUT /api/admin/sellers/:id/approve
export const approveSeller = asyncHandler(async (req, res) => {
  const profile = await prisma.sellerProfile.findUnique({ where: { id: req.params.id } });
  if (!profile) throw ApiError.notFound('Seller profile not found');

  await prisma.sellerProfile.update({
    where: { id: req.params.id },
    data: { status: 'APPROVED' },
  });

  await prisma.notification.create({
    data: {
      userId: profile.userId,
      title: 'Seller Account Approved!',
      message: 'Congratulations! Your seller account has been approved. You can now start adding products.',
      type: 'success',
      link: '/seller/dashboard',
    },
  });

  return ApiResponse.ok(res, 'Seller approved');
});

// PUT /api/admin/sellers/:id/reject
export const rejectSeller = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const profile = await prisma.sellerProfile.findUnique({ where: { id: req.params.id } });
  if (!profile) throw ApiError.notFound('Seller profile not found');

  await prisma.sellerProfile.update({
    where: { id: req.params.id },
    data: { status: 'REJECTED', rejectionReason: reason },
  });

  await prisma.notification.create({
    data: {
      userId: profile.userId,
      title: 'Seller Application Rejected',
      message: `Your seller application was rejected. Reason: ${reason || 'Not specified'}`,
      type: 'error',
    },
  });

  return ApiResponse.ok(res, 'Seller rejected');
});

// GET /api/admin/orders
export const getAllOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const where = {};
  if (status) where.status = status;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        items: { select: { quantity: true, total: true } },
        payment: { select: { method: true, status: true } },
        shipment: { select: { status: true } },
      },
    }),
    prisma.order.count({ where }),
  ]);

  return ApiResponse.ok(res, 'All orders fetched', {
    orders,
    pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
  });
});

// GET /api/admin/analytics
export const getAdminAnalytics = asyncHandler(async (req, res) => {
  // Monthly orders count for the last 12 months
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

  const [
    ordersByStatus,
    paymentsByMethod,
    topCategories,
    topProducts,
    monthlySales,
  ] = await Promise.all([
    prisma.order.groupBy({
      by: ['status'],
      _count: { id: true },
    }),
    prisma.payment.groupBy({
      by: ['method'],
      where: { status: 'COMPLETED' },
      _count: { id: true },
      _sum: { amount: true },
    }),
    prisma.product.groupBy({
      by: ['categoryId'],
      _count: { id: true },
      _sum: { totalSold: true },
      orderBy: { _sum: { totalSold: 'desc' } },
      take: 5,
    }),
    prisma.product.findMany({
      take: 10,
      orderBy: { totalSold: 'desc' },
      select: { name: true, totalSold: true, price: true, avgRating: true },
    }),
    prisma.order.groupBy({
      by: ['createdAt'],
      where: { createdAt: { gte: twelveMonthsAgo }, status: { not: 'CANCELLED' } },
      _count: { id: true },
      _sum: { grandTotal: true },
    }),
  ]);

  return ApiResponse.ok(res, 'Admin analytics', {
    ordersByStatus,
    paymentsByMethod,
    topCategories,
    topProducts,
    monthlySales,
  });
});

// GET /api/admin/contact-messages
export const getContactMessages = asyncHandler(async (req, res) => {
  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return ApiResponse.ok(res, 'Contact messages fetched', messages);
});

// Banners CRUD
export const getBanners = asyncHandler(async (req, res) => {
  const banners = await prisma.banner.findMany({ orderBy: { sortOrder: 'asc' } });
  return ApiResponse.ok(res, 'Banners fetched', banners);
});

export const createBanner = asyncHandler(async (req, res) => {
  const banner = await prisma.banner.create({ data: req.body });
  return ApiResponse.created(res, 'Banner created', banner);
});

export const updateBanner = asyncHandler(async (req, res) => {
  const banner = await prisma.banner.update({ where: { id: req.params.id }, data: req.body });
  return ApiResponse.ok(res, 'Banner updated', banner);
});

export const deleteBanner = asyncHandler(async (req, res) => {
  await prisma.banner.delete({ where: { id: req.params.id } });
  return ApiResponse.ok(res, 'Banner deleted');
});

// Notifications
export const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await prisma.notification.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  return ApiResponse.ok(res, 'Notifications fetched', notifications);
});

export const markNotificationRead = asyncHandler(async (req, res) => {
  await prisma.notification.update({
    where: { id: req.params.id },
    data: { isRead: true },
  });
  return ApiResponse.ok(res, 'Notification marked as read');
});

export const markAllNotificationsRead = asyncHandler(async (req, res) => {
  await prisma.notification.updateMany({
    where: { userId: req.user.id, isRead: false },
    data: { isRead: true },
  });
  return ApiResponse.ok(res, 'All notifications marked as read');
});
