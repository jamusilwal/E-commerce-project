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
  ESEWA_MERCHANT_CODE: process.env.ESEWA_MERCHANT_CODE,
  ESEWA_SECRET_KEY: process.env.ESEWA_SECRET_KEY,
  ESEWA_GATEWAY_URL: process.env.ESEWA_GATEWAY_URL || 'https://rc-epay.esewa.com.np',

  // Khalti
  KHALTI_SECRET_KEY: process.env.KHALTI_SECRET_KEY,
  KHALTI_GATEWAY_URL: process.env.KHALTI_GATEWAY_URL || 'https://a.khalti.com',

  // Helpers
  isDev: process.env.NODE_ENV === 'development',
  isProd: process.env.NODE_ENV === 'production',
};

export default env;
