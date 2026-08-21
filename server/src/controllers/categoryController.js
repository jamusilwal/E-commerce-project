import prisma from '../config/db.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * Category Controller
 */

// GET /api/categories — public
export const getCategories = asyncHandler(async (req, res) => {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
    include: {
      _count: { select: { products: true } },
    },
  });

  return ApiResponse.ok(res, 'Categories fetched', categories);
});

// GET /api/categories/:slug — public
export const getCategoryBySlug = asyncHandler(async (req, res) => {
  const category = await prisma.category.findUnique({
    where: { slug: req.params.slug },
    include: {
      _count: { select: { products: true } },
    },
  });

  if (!category) {
    return ApiResponse.ok(res, 'Category not found', null);
  }

  return ApiResponse.ok(res, 'Category fetched', category);
});

// POST /api/categories — admin only
export const createCategory = asyncHandler(async (req, res) => {
  const { name, slug, description, image, icon, sortOrder } = req.body;

  const category = await prisma.category.create({
    data: { name, slug, description, image, icon, sortOrder },
  });

  return ApiResponse.created(res, 'Category created', category);
});

// PUT /api/categories/:id — admin only
export const updateCategory = asyncHandler(async (req, res) => {
  const category = await prisma.category.update({
    where: { id: req.params.id },
    data: req.body,
  });

  return ApiResponse.ok(res, 'Category updated', category);
});

// DELETE /api/categories/:id — admin only
export const deleteCategory = asyncHandler(async (req, res) => {
  await prisma.category.delete({ where: { id: req.params.id } });
  return ApiResponse.ok(res, 'Category deleted');
});
