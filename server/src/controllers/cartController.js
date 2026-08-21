import prisma from '../config/db.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * Cart Controller — manages shopping cart
 */

// GET /api/cart
export const getCart = asyncHandler(async (req, res) => {
  let cart = await prisma.cart.findUnique({
    where: { userId: req.user.id },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: { where: { isPrimary: true }, take: 1 },
              inventory: { select: { quantity: true } },
              seller: { select: { shopName: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  // Create cart if doesn't exist
  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId: req.user.id },
      include: { items: { include: { product: true } } },
    });
  }

  // Calculate totals
  const subtotal = cart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  return ApiResponse.ok(res, 'Cart fetched', {
    ...cart,
    subtotal,
    itemCount,
  });
});

// POST /api/cart/items
export const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body;

  // Verify product exists and is active
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { inventory: true },
  });

  if (!product || !product.isActive) {
    throw ApiError.notFound('Product not found');
  }

  // Check stock
  if (product.inventory && product.inventory.quantity < quantity) {
    throw ApiError.badRequest(`Only ${product.inventory.quantity} items available`);
  }

  // Get or create cart
  let cart = await prisma.cart.findUnique({ where: { userId: req.user.id } });
  if (!cart) {
    cart = await prisma.cart.create({ data: { userId: req.user.id } });
  }

  // Check if product already in cart
  const existingItem = await prisma.cartItem.findUnique({
    where: {
      cartId_productId: { cartId: cart.id, productId },
    },
  });

  let cartItem;
  if (existingItem) {
    const newQty = existingItem.quantity + parseInt(quantity);
    if (product.inventory && product.inventory.quantity < newQty) {
      throw ApiError.badRequest(`Only ${product.inventory.quantity} items available`);
    }
    cartItem = await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: newQty },
      include: { product: { include: { images: { where: { isPrimary: true }, take: 1 } } } },
    });
  } else {
    cartItem = await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        quantity: parseInt(quantity),
      },
      include: { product: { include: { images: { where: { isPrimary: true }, take: 1 } } } },
    });
  }

  return ApiResponse.created(res, 'Added to cart', cartItem);
});

// PUT /api/cart/items/:id
export const updateCartItem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;

  const cart = await prisma.cart.findUnique({ where: { userId: req.user.id } });
  const item = await prisma.cartItem.findFirst({
    where: { id, cartId: cart?.id },
    include: { product: { include: { inventory: true } } },
  });

  if (!item) {
    throw ApiError.notFound('Cart item not found');
  }

  // Check stock
  if (item.product.inventory && item.product.inventory.quantity < parseInt(quantity)) {
    throw ApiError.badRequest(`Only ${item.product.inventory.quantity} items available`);
  }

  const updated = await prisma.cartItem.update({
    where: { id },
    data: { quantity: parseInt(quantity) },
    include: { product: { include: { images: { where: { isPrimary: true }, take: 1 } } } },
  });

  return ApiResponse.ok(res, 'Cart updated', updated);
});

// DELETE /api/cart/items/:id
export const removeCartItem = asyncHandler(async (req, res) => {
  const cart = await prisma.cart.findUnique({ where: { userId: req.user.id } });
  const item = await prisma.cartItem.findFirst({
    where: { id: req.params.id, cartId: cart?.id },
  });

  if (!item) {
    throw ApiError.notFound('Cart item not found');
  }

  await prisma.cartItem.delete({ where: { id: req.params.id } });

  return ApiResponse.ok(res, 'Item removed from cart');
});

// DELETE /api/cart — clear entire cart
export const clearCart = asyncHandler(async (req, res) => {
  const cart = await prisma.cart.findUnique({ where: { userId: req.user.id } });
  if (cart) {
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  }

  return ApiResponse.ok(res, 'Cart cleared');
});
