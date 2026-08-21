// API & App Constants

// API Base URL
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// App Info
export const APP_NAME = 'HAMROLOK BAZAR';
export const APP_TAGLINE = 'Discover Authentic Nepalese Handmade Products';
export const APP_DESCRIPTION =
  'A dedicated online marketplace connecting local Nepalese artisans with customers worldwide. Shop handcrafted jewelry, wooden crafts, pottery, Dhaka products, and more.';

// User Roles
export const ROLES = {
  CUSTOMER: 'CUSTOMER',
  SELLER: 'SELLER',
  ADMIN: 'ADMIN',
};

// Order Statuses
export const ORDER_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  PREPARING: 'PREPARING',
  PACKED: 'PACKED',
  SHIPPED: 'SHIPPED',
  OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
  RETURNED: 'RETURNED',
};

// Payment Methods
export const PAYMENT_METHODS = {
  ESEWA: 'ESEWA',
  KHALTI: 'KHALTI',
  COD: 'COD',
};

// Payment Statuses
export const PAYMENT_STATUS = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
};

// Product Categories
export const CATEGORIES = [
  { id: 'handmade-jewelry', name: 'Handmade Jewelry', icon: '💎' },
  { id: 'wooden-crafts', name: 'Wooden Crafts', icon: '🪵' },
  { id: 'pottery', name: 'Pottery', icon: '🏺' },
  { id: 'dhaka-products', name: 'Dhaka Products', icon: '🧵' },
  { id: 'traditional-clothing', name: 'Traditional Clothing', icon: '👘' },
  { id: 'home-decor', name: 'Home Decor', icon: '🏠' },
  { id: 'bamboo-crafts', name: 'Bamboo Crafts', icon: '🎋' },
  { id: 'handmade-bags', name: 'Handmade Bags', icon: '👜' },
  { id: 'paintings', name: 'Paintings', icon: '🎨' },
  { id: 'handmade-gifts', name: 'Handmade Gifts', icon: '🎁' },
];

// Nepal Provinces
export const PROVINCES = [
  'Koshi Province',
  'Madhesh Province',
  'Bagmati Province',
  'Gandaki Province',
  'Lumbini Province',
  'Karnali Province',
  'Sudurpashchim Province',
];

// Sort Options
export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'popularity', label: 'Most Popular' },
  { value: 'rating', label: 'Highest Rated' },
];

// Pagination
export const DEFAULT_PAGE_SIZE = 12;

// Image Placeholder
export const PLACEHOLDER_IMAGE = 'https://placehold.co/400x400/F8F4EC/8B1E3F?text=No+Image';
export const AVATAR_PLACEHOLDER = 'https://placehold.co/200x200/F8F4EC/8B1E3F?text=User';
