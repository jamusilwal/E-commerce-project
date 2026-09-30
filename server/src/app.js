import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import env from './config/env.js';
import { corsOptions, enforceHttps, securityHeaders } from './config/security.js';
import prisma from './config/db.js';
import errorHandler from './middleware/errorHandler.js';
import { authenticate } from './middleware/auth.js';
import ApiError from './utils/ApiError.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import addressRoutes from './routes/addressRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import productRoutes from './routes/productRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import sellerRoutes from './routes/sellerRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';

const app = express();

// ============================================
// Security Middleware
// ============================================

// Behind a TLS-terminating proxy, trust X-Forwarded-Proto / -For (see TRUST_PROXY in .env)
if (env.TRUST_PROXY && env.TRUST_PROXY !== 'false') {
  const value = env.TRUST_PROXY;
  // "1" = one proxy hop, "true" = trust all, otherwise an IP/subnet list such as "loopback"
  app.set('trust proxy', value === 'true' ? true : /^\d+$/.test(value) ? Number(value) : value);
}

// Redirect http:// to https:// (production default, see FORCE_HTTPS)
app.use(enforceHttps);

// Security headers incl. Strict-Transport-Security (see HSTS_ENABLED)
app.use(securityHeaders);

// CORS — only the configured frontend origin(s); localhost is also allowed outside production
app.use(cors(corsOptions));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: { success: false, message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// ============================================
// Body Parsing & Cookies
// ============================================

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ============================================
// Logging
// ============================================

if (env.isDev) {
  app.use(morgan('dev'));
}

// ============================================
// API Routes
// ============================================

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'HAMROLOK BAZAR API is running',
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/seller', sellerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);

// ============================================
// Public routes (banners for homepage)
// ============================================

app.get('/api/banners', async (req, res, next) => {
  try {
    const banners = await prisma.banner.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
    res.json({ success: true, data: banners });
  } catch (err) {
    next(err);
  }
});

// Contact form submission (public)
app.post('/api/contact', async (req, res, next) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    await prisma.contactMessage.create({
      data: { name, email, phone, subject, message },
    });
    res.status(201).json({ success: true, message: 'Message sent successfully' });
  } catch (err) {
    next(err);
  }
});

// Notifications (for authenticated users)
app.get('/api/notifications', authenticate, async (req, res, next) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    const unreadCount = await prisma.notification.count({
      where: { userId: req.user.id, isRead: false },
    });
    res.json({ success: true, data: { notifications, unreadCount } });
  } catch (err) {
    next(err);
  }
});

app.put('/api/notifications/:id/read', authenticate, async (req, res, next) => {
  try {
    await prisma.notification.update({
      where: { id: req.params.id },
      data: { isRead: true },
    });
    res.json({ success: true, message: 'Marked as read' });
  } catch (err) {
    next(err);
  }
});

app.put('/api/notifications/read-all', authenticate, async (req, res, next) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.id, isRead: false },
      data: { isRead: true },
    });
    res.json({ success: true, message: 'All marked as read' });
  } catch (err) {
    next(err);
  }
});

// ============================================
// 404 Handler
// ============================================

app.use((req, res, next) => {
  next(ApiError.notFound(`Route ${req.originalUrl} not found`));
});

// ============================================
// Global Error Handler
// ============================================

app.use(errorHandler);

export default app;
