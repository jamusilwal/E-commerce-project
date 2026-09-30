// API & App Constants

// API Base URL
// Defaults to the same origin ("/api", proxied to the backend by Vite in development), so it
// always uses the page's protocol. Set VITE_API_URL=https://api.example.com/api when the API
// lives on another domain.
const resolveApiUrl = () => {
  const url = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');
  // An https page cannot call a plain-http API on another host (mixed content), so upgrade it.
  // http://localhost is still allowed by browsers, which keeps local development working.
  if (
    typeof window !== 'undefined' &&
    window.location.protocol === 'https:' &&
    /^http:\/\//.test(url) &&
    !/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/.test(url)
  ) {
    return url.replace(/^http:/, 'https:');
  }
  return url;
};

export const API_URL = resolveApiUrl();

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

// Delivery (must match server/src/controllers/orderController.js)
export const FREE_DELIVERY_THRESHOLD = 5000;
export const DELIVERY_FEE = 150;

// Pagination
export const DEFAULT_PAGE_SIZE = 12;

// Image Placeholders — inline SVGs so they work offline and never 404
const svgPlaceholder = (label) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect width="400" height="400" fill="#F3EFE6"/><g fill="none" stroke="#1B4332" stroke-opacity=".35" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"><path d="M140 170h120l-10 110H150z"/><path d="M175 170v-18a25 25 0 0 1 50 0v18"/></g><text x="200" y="330" text-anchor="middle" font-family="sans-serif" font-size="22" fill="#1B4332" fill-opacity=".5">${label}</text></svg>`
  )}`;

export const PLACEHOLDER_IMAGE = svgPlaceholder('Handmade');
export const AVATAR_PLACEHOLDER = svgPlaceholder('User');
