import prisma from '../config/db.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * Review Controller — verified buyers only
 */

// GET /api/reviews/product/:productId
export const getProductReviews = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where: { productId: req.params.productId },
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { firstName: true, lastName: true, avatar: true } },
      },
    }),
    prisma.review.count({ where: { productId: req.params.productId } }),
  ]);

  return ApiResponse.ok(res, 'Reviews fetched', {
    reviews,
    pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
  });
});

// POST /api/reviews
export const createReview = asyncHandler(async (req, res) => {
  const { productId, rating, comment } = req.body;

  // Check if user has purchased this product
  const hasPurchased = await prisma.orderItem.findFirst({
    where: {
      productId,
      order: {
        userId: req.user.id,
        status: 'DELIVERED',
      },
    },
  });

  if (!hasPurchased) {
    throw ApiError.forbidden('You can only review products you have purchased');
  }

  // Check if already reviewed
  const existing = await prisma.review.findUnique({
    where: { userId_productId: { userId: req.user.id, productId } },
  });

  if (existing) {
    throw ApiError.conflict('You have already reviewed this product');
  }

  const review = await prisma.review.create({
    data: {
      userId: req.user.id,
      productId,
      rating: parseInt(rating),
      comment,
      isVerified: true,
    },
    include: {
      user: { select: { firstName: true, lastName: true, avatar: true } },
    },
  });

  // Update product average rating
  const stats = await prisma.review.aggregate({
    where: { productId },
    _avg: { rating: true },
    _count: { rating: true },
  });

  await prisma.product.update({
    where: { id: productId },
    data: {
      avgRating: Math.round((stats._avg.rating || 0) * 10) / 10,
      totalReviews: stats._count.rating,
    },
  });

  return ApiResponse.created(res, 'Review submitted', review);
});

// DELETE /api/reviews/:id
export const deleteReview = asyncHandler(async (req, res) => {
  const review = await prisma.review.findUnique({ where: { id: req.params.id } });

  if (!review) {
    throw ApiError.notFound('Review not found');
  }

  if (review.userId !== req.user.id && req.user.role !== 'ADMIN') {
    throw ApiError.forbidden('Access denied');
  }

  await prisma.review.delete({ where: { id: req.params.id } });

  // Update product rating
  const stats = await prisma.review.aggregate({
    where: { productId: review.productId },
    _avg: { rating: true },
    _count: { rating: true },
  });

  await prisma.product.update({
    where: { id: review.productId },
    data: {
      avgRating: Math.round((stats._avg.rating || 0) * 10) / 10,
      totalReviews: stats._count.rating,
    },
  });

  return ApiResponse.ok(res, 'Review deleted');
});
