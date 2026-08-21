import prisma from '../config/db.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * Wishlist Controller
 */

// GET /api/wishlist
export const getWishlist = asyncHandler(async (req, res) => {
  let wishlist = await prisma.wishlist.findUnique({
    where: { userId: req.user.id },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: { where: { isPrimary: true }, take: 1 },
              category: { select: { name: true, slug: true } },
              inventory: { select: { quantity: true } },
              seller: { select: { shopName: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!wishlist) {
    wishlist = await prisma.wishlist.create({
      data: { userId: req.user.id },
      include: { items: true },
    });
  }

  return ApiResponse.ok(res, 'Wishlist fetched', wishlist);
});

// POST /api/wishlist/items
export const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    throw ApiError.notFound('Product not found');
  }

  let wishlist = await prisma.wishlist.findUnique({ where: { userId: req.user.id } });
  if (!wishlist) {
    wishlist = await prisma.wishlist.create({ data: { userId: req.user.id } });
  }

  // Check if already in wishlist
  const existing = await prisma.wishlistItem.findUnique({
    where: { wishlistId_productId: { wishlistId: wishlist.id, productId } },
  });

  if (existing) {
    throw ApiError.conflict('Product already in wishlist');
  }

  const item = await prisma.wishlistItem.create({
    data: { wishlistId: wishlist.id, productId },
    include: { product: { include: { images: { where: { isPrimary: true }, take: 1 } } } },
  });

  return ApiResponse.created(res, 'Added to wishlist', item);
});

// DELETE /api/wishlist/items/:productId
export const removeFromWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const wishlist = await prisma.wishlist.findUnique({ where: { userId: req.user.id } });
  if (!wishlist) {
    throw ApiError.notFound('Wishlist not found');
  }

  const item = await prisma.wishlistItem.findUnique({
    where: { wishlistId_productId: { wishlistId: wishlist.id, productId } },
  });

  if (!item) {
    throw ApiError.notFound('Item not in wishlist');
  }

  await prisma.wishlistItem.delete({ where: { id: item.id } });

  return ApiResponse.ok(res, 'Removed from wishlist');
});

// POST /api/wishlist/move-to-cart/:productId
export const moveToCart = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  // Remove from wishlist
  const wishlist = await prisma.wishlist.findUnique({ where: { userId: req.user.id } });
  if (wishlist) {
    await prisma.wishlistItem.deleteMany({
      where: { wishlistId: wishlist.id, productId },
    });
  }

  // Add to cart
  let cart = await prisma.cart.findUnique({ where: { userId: req.user.id } });
  if (!cart) {
    cart = await prisma.cart.create({ data: { userId: req.user.id } });
  }

  const existingCartItem = await prisma.cartItem.findUnique({
    where: { cartId_productId: { cartId: cart.id, productId } },
  });

  if (existingCartItem) {
    await prisma.cartItem.update({
      where: { id: existingCartItem.id },
      data: { quantity: existingCartItem.quantity + 1 },
    });
  } else {
    await prisma.cartItem.create({
      data: { cartId: cart.id, productId, quantity: 1 },
    });
  }

  return ApiResponse.ok(res, 'Moved to cart');
});
