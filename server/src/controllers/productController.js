import prisma from '../config/db.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import cloudinary from '../config/cloudinary.js';

/**
 * Product Controller — handles product CRUD and public browsing
 */

// GET /api/products — public (with search, filter, sort, pagination)
export const getProducts = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 12,
    search,
    category,
    minPrice,
    maxPrice,
    rating,
    sort = 'newest',
    seller,
    featured,
  } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  // Build where clause
  const where = {
    isActive: true,
    seller: { status: 'APPROVED' },
  };

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { tags: { hasSome: [search.toLowerCase()] } },
    ];
  }

  if (category) {
    where.category = { slug: category };
  }

  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = parseFloat(minPrice);
    if (maxPrice) where.price.lte = parseFloat(maxPrice);
  }

  if (rating) {
    where.avgRating = { gte: parseFloat(rating) };
  }

  if (seller) {
    where.sellerId = seller;
  }

  if (featured === 'true') {
    where.isFeatured = true;
  }

  // Build orderBy
  let orderBy = {};
  switch (sort) {
    case 'price_asc':
      orderBy = { price: 'asc' };
      break;
    case 'price_desc':
      orderBy = { price: 'desc' };
      break;
    case 'popularity':
      orderBy = { totalSold: 'desc' };
      break;
    case 'rating':
      orderBy = { avgRating: 'desc' };
      break;
    case 'newest':
    default:
      orderBy = { createdAt: 'desc' };
      break;
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take,
      orderBy,
      include: {
        images: {
          where: { isPrimary: true },
          take: 1,
        },
        category: { select: { name: true, slug: true } },
        seller: {
          select: { shopName: true, id: true, rating: true },
        },
        inventory: { select: { quantity: true } },
      },
    }),
    prisma.product.count({ where }),
  ]);

  return ApiResponse.ok(res, 'Products fetched', {
    products,
    pagination: {
      page: parseInt(page),
      limit: take,
      total,
      pages: Math.ceil(total / take),
    },
  });
});

// GET /api/products/:slug — public
export const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await prisma.product.findUnique({
    where: { slug: req.params.slug },
    include: {
      images: { orderBy: { sortOrder: 'asc' } },
      category: { select: { id: true, name: true, slug: true } },
      seller: {
        select: {
          id: true,
          shopName: true,
          shopLogo: true,
          rating: true,
          totalSales: true,
          user: { select: { firstName: true, lastName: true, avatar: true } },
        },
      },
      inventory: true,
      reviews: {
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { firstName: true, lastName: true, avatar: true } },
        },
      },
      _count: { select: { reviews: true } },
    },
  });

  if (!product) {
    throw ApiError.notFound('Product not found');
  }

  return ApiResponse.ok(res, 'Product fetched', product);
});

// GET /api/products/:id/related — public
export const getRelatedProducts = asyncHandler(async (req, res) => {
  const product = await prisma.product.findUnique({
    where: { id: req.params.id },
    select: { categoryId: true, id: true },
  });

  if (!product) {
    throw ApiError.notFound('Product not found');
  }

  const related = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: product.id },
      isActive: true,
    },
    take: 8,
    orderBy: { totalSold: 'desc' },
    include: {
      images: { where: { isPrimary: true }, take: 1 },
      category: { select: { name: true, slug: true } },
    },
  });

  return ApiResponse.ok(res, 'Related products fetched', related);
});

// POST /api/products — seller only
export const createProduct = asyncHandler(async (req, res) => {
  const seller = await prisma.sellerProfile.findUnique({
    where: { userId: req.user.id },
  });

  if (!seller || seller.status !== 'APPROVED') {
    throw ApiError.forbidden('Your seller account must be approved to add products');
  }

  const {
    name, slug, description, shortDescription, materials,
    price, comparePrice, sku, categoryId, isFeatured,
    estimatedDelivery, weight, dimensions, tags, quantity,
  } = req.body;

  const product = await prisma.product.create({
    data: {
      sellerId: seller.id,
      categoryId,
      name,
      slug,
      description,
      shortDescription,
      materials,
      price: parseFloat(price),
      comparePrice: comparePrice ? parseFloat(comparePrice) : null,
      sku,
      isFeatured: isFeatured || false,
      estimatedDelivery,
      weight: weight ? parseFloat(weight) : null,
      dimensions,
      tags: tags || [],
      inventory: {
        create: {
          quantity: parseInt(quantity) || 0,
        },
      },
    },
    include: {
      images: true,
      inventory: true,
      category: { select: { name: true } },
    },
  });

  return ApiResponse.created(res, 'Product created', product);
});

// PUT /api/products/:id — seller only (own products)
export const updateProduct = asyncHandler(async (req, res) => {
  const seller = await prisma.sellerProfile.findUnique({
    where: { userId: req.user.id },
  });

  const existing = await prisma.product.findFirst({
    where: { id: req.params.id, sellerId: seller?.id },
  });

  if (!existing) {
    throw ApiError.notFound('Product not found or access denied');
  }

  const { quantity, ...productData } = req.body;

  // Convert numeric fields
  if (productData.price) productData.price = parseFloat(productData.price);
  if (productData.comparePrice) productData.comparePrice = parseFloat(productData.comparePrice);
  if (productData.weight) productData.weight = parseFloat(productData.weight);

  const product = await prisma.product.update({
    where: { id: req.params.id },
    data: productData,
    include: { images: true, inventory: true },
  });

  // Update inventory if quantity provided
  if (quantity !== undefined) {
    await prisma.inventory.upsert({
      where: { productId: product.id },
      update: { quantity: parseInt(quantity) },
      create: { productId: product.id, quantity: parseInt(quantity) },
    });
  }

  return ApiResponse.ok(res, 'Product updated', product);
});

// DELETE /api/products/:id — seller (own) or admin
export const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (req.user.role === 'ADMIN') {
    await prisma.product.delete({ where: { id } });
  } else {
    const seller = await prisma.sellerProfile.findUnique({
      where: { userId: req.user.id },
    });
    const product = await prisma.product.findFirst({
      where: { id, sellerId: seller?.id },
    });
    if (!product) {
      throw ApiError.notFound('Product not found or access denied');
    }
    await prisma.product.delete({ where: { id } });
  }

  return ApiResponse.ok(res, 'Product deleted');
});

// POST /api/products/:id/images — upload product images
export const uploadProductImages = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Verify product ownership
  const seller = await prisma.sellerProfile.findUnique({
    where: { userId: req.user.id },
  });
  const product = await prisma.product.findFirst({
    where: { id, sellerId: seller?.id },
  });

  if (!product) {
    throw ApiError.notFound('Product not found or access denied');
  }

  if (!req.files || req.files.length === 0) {
    throw ApiError.badRequest('No images uploaded');
  }

  const existingCount = await prisma.productImage.count({
    where: { productId: id },
  });

  const images = [];
  for (let i = 0; i < req.files.length; i++) {
    const file = req.files[i];

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'hamrolok-bazar/products',
          transformation: [{ width: 800, height: 800, crop: 'limit', quality: 'auto' }],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(file.buffer);
    });

    const image = await prisma.productImage.create({
      data: {
        productId: id,
        url: result.secure_url,
        publicId: result.public_id,
        isPrimary: existingCount === 0 && i === 0,
        sortOrder: existingCount + i,
      },
    });

    images.push(image);
  }

  return ApiResponse.created(res, 'Images uploaded', images);
});

// GET /api/products/seller/my-products — seller's own products
export const getSellerProducts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const seller = await prisma.sellerProfile.findUnique({
    where: { userId: req.user.id },
  });

  if (!seller) {
    throw ApiError.notFound('Seller profile not found');
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where: { sellerId: seller.id },
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        category: { select: { name: true } },
        inventory: { select: { quantity: true } },
        _count: { select: { orderItems: true, reviews: true } },
      },
    }),
    prisma.product.count({ where: { sellerId: seller.id } }),
  ]);

  return ApiResponse.ok(res, 'Seller products fetched', {
    products,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
});
