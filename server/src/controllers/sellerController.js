import prisma from '../config/db.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * Seller Controller — seller registration, dashboard, and order management
 */

// POST /api/seller/register — register as seller
export const registerSeller = asyncHandler(async (req, res) => {
  const { shopName, shopDescription, businessPhone, businessEmail, businessAddress, panNumber } = req.body;

  // Check if already a seller
  const existing = await prisma.sellerProfile.findUnique({
    where: { userId: req.user.id },
  });

  if (existing) {
    throw ApiError.conflict('You already have a seller profile');
  }

  // Update user role
  await prisma.user.update({
    where: { id: req.user.id },
    data: { role: 'SELLER' },
  });

  const profile = await prisma.sellerProfile.create({
    data: {
      userId: req.user.id,
      shopName,
      shopDescription,
      businessPhone,
      businessEmail,
      businessAddress,
      panNumber,
      status: 'PENDING',
    },
  });

  return ApiResponse.created(res, 'Seller registration submitted. Waiting for admin approval.', profile);
});

// GET /api/seller/dashboard — seller dashboard stats
export const getSellerDashboard = asyncHandler(async (req, res) => {
  const seller = await prisma.sellerProfile.findUnique({
    where: { userId: req.user.id },
  });

  if (!seller) {
    throw ApiError.notFound('Seller profile not found');
  }

  // Get stats
  const [totalProducts, totalOrders, pendingOrders, deliveredOrders, revenue, recentOrders] =
    await Promise.all([
      prisma.product.count({ where: { sellerId: seller.id } }),
      prisma.orderItem.count({
        where: { product: { sellerId: seller.id } },
      }),
      prisma.orderItem.count({
        where: {
          product: { sellerId: seller.id },
          order: { status: 'PENDING' },
        },
      }),
      prisma.orderItem.count({
        where: {
          product: { sellerId: seller.id },
          order: { status: 'DELIVERED' },
        },
      }),
      prisma.orderItem.aggregate({
        where: {
          product: { sellerId: seller.id },
          order: { status: 'DELIVERED' },
        },
        _sum: { total: true },
      }),
      prisma.orderItem.findMany({
        where: { product: { sellerId: seller.id } },
        take: 5,
        orderBy: { order: { createdAt: 'desc' } },
        include: {
          order: {
            select: { orderNumber: true, status: true, createdAt: true },
          },
          product: { select: { name: true } },
        },
      }),
    ]);

  return ApiResponse.ok(res, 'Seller dashboard', {
    profile: seller,
    stats: {
      totalProducts,
      totalOrders,
      pendingOrders,
      deliveredOrders,
      revenue: revenue._sum.total || 0,
    },
    recentOrders,
  });
});

// GET /api/seller/orders — seller's orders
export const getSellerOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const seller = await prisma.sellerProfile.findUnique({
    where: { userId: req.user.id },
  });

  if (!seller) {
    throw ApiError.notFound('Seller profile not found');
  }

  const where = { product: { sellerId: seller.id } };
  if (status) where.order = { status };

  const [orderItems, total] = await Promise.all([
    prisma.orderItem.findMany({
      where,
      skip,
      take: parseInt(limit),
      orderBy: { order: { createdAt: 'desc' } },
      include: {
        order: {
          include: {
            user: { select: { firstName: true, lastName: true, email: true } },
            address: true,
            payment: { select: { method: true, status: true } },
            shipment: { select: { status: true, trackingNumber: true } },
          },
        },
        product: {
          select: { name: true, images: { where: { isPrimary: true }, take: 1 } },
        },
      },
    }),
    prisma.orderItem.count({ where }),
  ]);

  return ApiResponse.ok(res, 'Seller orders fetched', {
    orders: orderItems,
    pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
  });
});

// GET /api/seller/analytics — seller analytics
export const getSellerAnalytics = asyncHandler(async (req, res) => {
  const seller = await prisma.sellerProfile.findUnique({
    where: { userId: req.user.id },
  });

  if (!seller) {
    throw ApiError.notFound('Seller profile not found');
  }

  // Monthly revenue for the last 6 months
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const monthlyData = await prisma.orderItem.groupBy({
    by: ['orderId'],
    where: {
      product: { sellerId: seller.id },
      order: { status: 'DELIVERED', createdAt: { gte: sixMonthsAgo } },
    },
    _sum: { total: true },
  });

  // Top products
  const topProducts = await prisma.product.findMany({
    where: { sellerId: seller.id },
    take: 5,
    orderBy: { totalSold: 'desc' },
    select: { name: true, totalSold: true, price: true, avgRating: true },
  });

  return ApiResponse.ok(res, 'Seller analytics', {
    monthlyRevenue: monthlyData,
    topProducts,
  });
});
