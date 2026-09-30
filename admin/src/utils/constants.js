const resolveApiUrl = () => {
  const url = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');
  if (typeof window !== 'undefined' && window.location.protocol === 'https:' && /^http:\/\//.test(url)) {
    return url.replace(/^http:/, 'https:');
  }
  return url;
};

export const API_URL = resolveApiUrl();

export const APP_NAME = 'HAMROLOK BAZAR';
export const ADMIN_PANEL_NAME = 'Admin Control Center';

export const ROLES = {
  CUSTOMER: 'CUSTOMER',
  SELLER: 'SELLER',
  ADMIN: 'ADMIN',
};

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

export const ORDER_STATUS_COLORS = {
  PENDING: 'bg-amber-100 text-amber-800 border-amber-200',
  CONFIRMED: 'bg-blue-100 text-blue-800 border-blue-200',
  PREPARING: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  PACKED: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  SHIPPED: 'bg-purple-100 text-purple-800 border-purple-200',
  OUT_FOR_DELIVERY: 'bg-orange-100 text-orange-800 border-orange-200',
  DELIVERED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  CANCELLED: 'bg-rose-100 text-rose-800 border-rose-200',
  RETURNED: 'bg-slate-100 text-slate-800 border-slate-200',
};

export const PAYMENT_METHODS = {
  ESEWA: 'ESEWA',
  KHALTI: 'KHALTI',
  COD: 'COD',
};

export const PAYMENT_STATUS = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
};

export const PAYMENT_STATUS_COLORS = {
  PENDING: 'bg-amber-100 text-amber-800 border-amber-200',
  COMPLETED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  FAILED: 'bg-rose-100 text-rose-800 border-rose-200',
  REFUNDED: 'bg-slate-100 text-slate-800 border-slate-200',
};

const svgPlaceholder = (label) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect width="400" height="400" fill="#F1F5F9"/><g fill="none" stroke="#0F2E22" stroke-opacity=".3" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"><path d="M140 170h120l-10 110H150z"/><path d="M175 170v-18a25 25 0 0 1 50 0v18"/></g><text x="200" y="330" text-anchor="middle" font-family="sans-serif" font-size="22" fill="#0F2E22" fill-opacity=".5">${label}</text></svg>`
  )}`;

export const PLACEHOLDER_IMAGE = svgPlaceholder('Handmade');
export const AVATAR_PLACEHOLDER = svgPlaceholder('Admin');
