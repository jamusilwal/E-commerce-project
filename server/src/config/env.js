import dotenv from 'dotenv';
dotenv.config();

/**
 * Centralized environment configuration.
 * Validates required env vars at startup.
 */
const env = {
  // Server
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT, 10) || 5001,

  // Database
  DATABASE_URL: process.env.DATABASE_URL,

  // JWT
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  JWT_ACCESS_EXPIRY: process.env.JWT_ACCESS_EXPIRY || '15m',
  JWT_REFRESH_EXPIRY: process.env.JWT_REFRESH_EXPIRY || '7d',

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,

  // Frontend URL
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',

  // eSewa
  ESEWA_MERCHANT_CODE: process.env.ESEWA_MERCHANT_CODE || 'EPAYTEST',
  ESEWA_SECRET_KEY: process.env.ESEWA_SECRET_KEY || '8gBm/:&EnhH.1/q',
  ESEWA_GATEWAY_URL: process.env.ESEWA_GATEWAY_URL || 'https://rc-epay.esewa.com.np',

  // Khalti
  KHALTI_SECRET_KEY: process.env.KHALTI_SECRET_KEY,
  KHALTI_GATEWAY_URL: process.env.KHALTI_GATEWAY_URL || 'https://a.khalti.com',

  // Helpers
  isDev: process.env.NODE_ENV === 'development',
  isProd: process.env.NODE_ENV === 'production',
};

// ============================================
// HTTPS / transport security
// ============================================

const isProd = env.isProd;
const flag = (value, fallback) =>
  value === undefined || value === '' ? fallback : ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase());

// Frontend origins allowed by CORS (comma-separated, e.g. "https://shop.com,https://www.shop.com")
env.CLIENT_URLS = (process.env.CLIENT_URLS || env.CLIENT_URL)
  .split(',')
  .map((url) => url.trim().replace(/\/$/, ''))
  .filter(Boolean);

// Built-in TLS: set both paths to serve HTTPS directly from Node (local dev or a VPS without a proxy)
env.SSL_KEY_PATH = process.env.SSL_KEY_PATH || '';
env.SSL_CERT_PATH = process.env.SSL_CERT_PATH || '';
env.HTTPS_ENABLED = Boolean(env.SSL_KEY_PATH && env.SSL_CERT_PATH);
// Optional plain-HTTP port that only redirects to HTTPS (e.g. 80 -> 443). Empty = disabled.
env.HTTP_REDIRECT_PORT = parseInt(process.env.HTTP_REDIRECT_PORT, 10) || null;

// Behind a reverse proxy / PaaS (Nginx, Render, Railway, Heroku...) that terminates TLS,
// trust its X-Forwarded-* headers so req.secure and req.ip are correct.
env.TRUST_PROXY = process.env.TRUST_PROXY ?? (isProd ? '1' : '');

// Redirect http:// requests to https:// (on by default in production)
env.FORCE_HTTPS = flag(process.env.FORCE_HTTPS, isProd);

// Strict-Transport-Security header (on by default in production; never enable on plain-HTTP localhost)
env.HSTS_ENABLED = flag(process.env.HSTS_ENABLED, isProd);
env.HSTS_MAX_AGE = parseInt(process.env.HSTS_MAX_AGE, 10) || 31536000; // 1 year
env.HSTS_PRELOAD = flag(process.env.HSTS_PRELOAD, false);

// Refresh-token cookie. Use SameSite=none when the frontend and API are on different sites
// (e.g. vercel.app + onrender.com); strict/lax when they share a site (shop.com + api.shop.com).
env.COOKIE_SAME_SITE = (process.env.COOKIE_SAME_SITE || (isProd ? 'strict' : 'lax')).toLowerCase();
env.COOKIE_SECURE = flag(process.env.COOKIE_SECURE, isProd || env.HTTPS_ENABLED || env.COOKIE_SAME_SITE === 'none');
env.COOKIE_DOMAIN = process.env.COOKIE_DOMAIN || undefined;

if (!['strict', 'lax', 'none'].includes(env.COOKIE_SAME_SITE)) {
  throw new Error(`COOKIE_SAME_SITE must be strict, lax or none (got "${env.COOKIE_SAME_SITE}")`);
}
if (env.COOKIE_SAME_SITE === 'none' && !env.COOKIE_SECURE) {
  throw new Error('COOKIE_SAME_SITE=none requires COOKIE_SECURE=true (browsers reject it otherwise)');
}
if (isProd && env.CLIENT_URLS.some((url) => url.startsWith('http://'))) {
  console.warn('⚠️  CLIENT_URL uses http:// in production — use https:// so payments and cookies stay secure.');
}

export default env;
