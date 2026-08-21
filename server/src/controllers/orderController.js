import prisma from '../config/db.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Order Controller — handles checkout, order management, and tracking
 */

// POST /api/orders — create order (checkout)
export const createOrder = asyncHandler(async (req, res) => {
  const { addressId, paymentMethod, couponCode, notes } = req.body;

  // Get cart with items
  const cart = await prisma.cart.findUnique({
    where: { userId: req.user.id },
    include: {
      items: {
        include: {
          product: { include: { inventory: true } },
        },
      },
    },
  });

  if (!cart || cart.items.length === 0) {
    throw ApiError.badRequest('Cart is empty');
  }

  // Verify address
  const address = await prisma.address.findFirst({
    where: { id: addressId, userId: req.user.id },
  });
  if (!address) {
    throw ApiError.notFound('Shipping address not found');
  }

  // Check stock for all items
  for (const item of cart.items) {
    if (item.product.inventory && item.product.inventory.quantity < item.quantity) {
      throw ApiError.badRequest(
        `Insufficient stock for "${item.product.name}". Available: ${item.product.inventory.quantity}`
      );
    }
  }

  // Calculate totals
  let subtotal = 0;
  const orderItems = cart.items.map((item) => {
    const total = item.product.price * item.quantity;
    subtotal += total;
    return {
      productId: item.productId,
      quantity: item.quantity,
      price: item.product.price,
      total,
    };
  });

  // Delivery charge (flat rate for now)
  const deliveryCharge = subtotal >= 5000 ? 0 : 150;

  // Apply coupon discount
  let discount = 0;
  let couponId = null;
  if (couponCode) {
    const coupon = await prisma.coupon.findUnique({ where: { code: couponCode } });
    if (coupon && coupon.isActive && new Date() <= coupon.validUntil && new Date() >= coupon.validFrom) {
      if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
        throw ApiError.badRequest('Coupon usage limit reached');
      }
      if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
        throw ApiError.badRequest(`Minimum order amount is Rs. ${coupon.minOrderAmount}`);
      }

      if (coupon.discountType === 'percentage') {
        discount = (subtotal * coupon.discountValue) / 100;
        if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
      } else {
        discount = coupon.discountValue;
      }

      couponId = coupon.id;
    }
  }

  const grandTotal = subtotal + deliveryCharge - discount;
  const orderNumber = `HLB-${Date.now().toString(36).toUpperCase()}-${uuidv4().slice(0, 4).toUpperCase()}`;

  // Create order in a transaction
  const order = await prisma.$transaction(async (tx) => {
    // Create the order
    const newOrder = await tx.order.create({
      data: {
        orderNumber,
        userId: req.user.id,
        addressId,
        subtotal,
        deliveryCharge,
        discount,
        grandTotal,
        couponId,
        notes,
        items: { create: orderItems },
        payment: {
          create: {
            method: paymentMethod,
            amount: grandTotal,
            status: paymentMethod === 'COD' ? 'PENDING' : 'PENDING',
          },
        },
        shipment: {
          create: {
            status: 'PROCESSING',
          },
        },
      },
      include: {
        items: { include: { product: { select: { name: true } } } },
        payment: true,
        shipment: true,
        address: true,
      },
    });

    // Reduce inventory for all items
    for (const item of cart.items) {
      if (item.product.inventory) {
        await tx.inventory.update({
          where: { productId: item.productId },
          data: { quantity: { decrement: item.quantity } },
        });
      }
      // Increment product totalSold
      await tx.product.update({
        where: { id: item.productId },
        data: { totalSold: { increment: item.quantity } },
      });
    }

    // Update coupon usage
    if (couponId) {
      await tx.coupon.update({
        where: { id: couponId },
        data: { usedCount: { increment: 1 } },
      });
    }

    // Clear cart
    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

    // Create notification
    await tx.notification.create({
      data: {
        userId: req.user.id,
        title: 'Order Placed!',
        message: `Your order ${orderNumber} has been placed successfully.`,
        type: 'order',
        link: `/orders/${newOrder.id}`,
      },
    });

    return newOrder;
  });

  return ApiResponse.created(res, 'Order placed successfully', order);
});

// GET /api/orders — customer's orders
export const getMyOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const where = { userId: req.user.id };
  if (status) where.status = status;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
                slug: true,
                images: { where: { isPrimary: true }, take: 1 },
              },
            },
          },
        },
        payment: { select: { method: true, status: true } },
        shipment: { select: { status: true, trackingNumber: true } },
      },
    }),
    prisma.order.count({ where }),
  ]);

  return ApiResponse.ok(res, 'Orders fetched', {
    orders,
    pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
  });
});

// GET /api/orders/:id
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await prisma.order.findFirst({
    where: {
      id: req.params.id,
      ...(req.user.role === 'ADMIN' ? {} : { userId: req.user.id }),
    },
    include: {
      items: {
        include: {
          product: {
            select: {
              name: true,
              slug: true,
              images: { where: { isPrimary: true }, take: 1 },
              seller: { select: { shopName: true } },
            },
          },
        },
      },
      payment: true,
      shipment: true,
      address: true,
      user: { select: { firstName: true, lastName: true, email: true, phone: true } },
    },
  });

  if (!order) {
    throw ApiError.notFound('Order not found');
  }

  return ApiResponse.ok(res, 'Order fetched', order);
});

// PUT /api/orders/:id/cancel — customer cancels before shipment
export const cancelOrder = asyncHandler(async (req, res) => {
  const order = await prisma.order.findFirst({
    where: { id: req.params.id, userId: req.user.id },
    include: { items: true, payment: true },
  });

  if (!order) {
    throw ApiError.notFound('Order not found');
  }

  const cancellableStatuses = ['PENDING', 'CONFIRMED', 'PREPARING'];
  if (!cancellableStatuses.includes(order.status)) {
    throw ApiError.badRequest('Order cannot be cancelled at this stage');
  }

  await prisma.$transaction(async (tx) => {
    // Update order status
    await tx.order.update({
      where: { id: order.id },
      data: { status: 'CANCELLED', cancelReason: req.body.reason || 'Cancelled by customer' },
    });

    // Restore inventory
    for (const item of order.items) {
      await tx.inventory.update({
        where: { productId: item.productId },
        data: { quantity: { increment: item.quantity } },
      });
      await tx.product.update({
        where: { id: item.productId },
        data: { totalSold: { decrement: item.quantity } },
      });
    }

    // Update payment status if paid
    if (order.payment && order.payment.status === 'COMPLETED') {
      await tx.payment.update({
        where: { id: order.payment.id },
        data: { status: 'REFUNDED' },
      });
    }

    // Notification
    await tx.notification.create({
      data: {
        userId: req.user.id,
        title: 'Order Cancelled',
        message: `Your order ${order.orderNumber} has been cancelled.`,
        type: 'order',
        link: `/orders/${order.id}`,
      },
    });
  });

  return ApiResponse.ok(res, 'Order cancelled');
});

// PUT /api/orders/:id/status — admin/seller updates order status
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, trackingNumber, courierName, estimatedDelivery } = req.body;

  const order = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: { shipment: true },
  });

  if (!order) {
    throw ApiError.notFound('Order not found');
  }

  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: order.id },
      data: { status },
    });

    // Update shipment info
    if (order.shipment) {
      const shipmentData = {};
      if (status === 'SHIPPED') {
        shipmentData.status = 'SHIPPED';
        shipmentData.shippedAt = new Date();
      }
      if (status === 'OUT_FOR_DELIVERY') shipmentData.status = 'OUT_FOR_DELIVERY';
      if (status === 'DELIVERED') {
        shipmentData.status = 'DELIVERED';
        shipmentData.deliveredAt = new Date();
      }
      if (trackingNumber) shipmentData.trackingNumber = trackingNumber;
      if (courierName) shipmentData.courierName = courierName;
      if (estimatedDelivery) shipmentData.estimatedDelivery = new Date(estimatedDelivery);

      if (Object.keys(shipmentData).length > 0) {
        await tx.shipment.update({
          where: { id: order.shipment.id },
          data: shipmentData,
        });
      }
    }

    // Payment auto-complete for COD on delivery
    if (status === 'DELIVERED') {
      await tx.payment.updateMany({
        where: { orderId: order.id, method: 'COD', status: 'PENDING' },
        data: { status: 'COMPLETED', paidAt: new Date() },
      });
    }

    // Notification
    await tx.notification.create({
      data: {
        userId: order.userId,
        title: `Order ${status.replace(/_/g, ' ')}`,
        message: `Your order ${order.orderNumber} is now ${status.replace(/_/g, ' ').toLowerCase()}.`,
        type: 'order',
        link: `/orders/${order.id}`,
      },
    });
  });

  return ApiResponse.ok(res, 'Order status updated');
});
