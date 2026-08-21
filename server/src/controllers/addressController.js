import prisma from '../config/db.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * Address Controller — manages user shipping addresses
 */

// GET /api/addresses
export const getAddresses = asyncHandler(async (req, res) => {
  const addresses = await prisma.address.findMany({
    where: { userId: req.user.id },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
  });

  return ApiResponse.ok(res, 'Addresses fetched', addresses);
});

// POST /api/addresses
export const createAddress = asyncHandler(async (req, res) => {
  const { fullName, phone, province, district, municipality, ward, street, postalCode, isDefault, label } = req.body;

  // If setting as default, unset other defaults
  if (isDefault) {
    await prisma.address.updateMany({
      where: { userId: req.user.id, isDefault: true },
      data: { isDefault: false },
    });
  }

  const address = await prisma.address.create({
    data: {
      userId: req.user.id,
      fullName,
      phone,
      province,
      district,
      municipality,
      ward,
      street,
      postalCode,
      isDefault: isDefault || false,
      label,
    },
  });

  return ApiResponse.created(res, 'Address added', address);
});

// PUT /api/addresses/:id
export const updateAddress = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Verify ownership
  const existing = await prisma.address.findFirst({
    where: { id, userId: req.user.id },
  });

  if (!existing) {
    throw ApiError.notFound('Address not found');
  }

  const { isDefault, ...data } = req.body;

  // If setting as default, unset other defaults
  if (isDefault) {
    await prisma.address.updateMany({
      where: { userId: req.user.id, isDefault: true },
      data: { isDefault: false },
    });
  }

  const address = await prisma.address.update({
    where: { id },
    data: { ...data, isDefault },
  });

  return ApiResponse.ok(res, 'Address updated', address);
});

// DELETE /api/addresses/:id
export const deleteAddress = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const existing = await prisma.address.findFirst({
    where: { id, userId: req.user.id },
  });

  if (!existing) {
    throw ApiError.notFound('Address not found');
  }

  await prisma.address.delete({ where: { id } });

  return ApiResponse.ok(res, 'Address deleted');
});
