import helmet from 'helmet';
import env from './env.js';

/**
 * Transport-security middleware shared by the app: CORS allowlist,
 * HTTP -> HTTPS redirect, HSTS / security headers and cookie options.
 */

// Local dev origins (http and https) are allowed outside production only
const LOCAL_ORIGIN = /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/;

const isAllowedOrigin = (origin) =>
  env.CLIENT_URLS.includes(origin.replace(/\/$/, '')) || (!env.isProd && LOCAL_ORIGIN.test(origin));

export const corsOptions = {
  origin: (origin, callback) => {
    // Same-origin requests, curl, mobile apps and server-to-server calls send no Origin header
    if (!origin || isAllowedOrigin(origin)) return callback(null, true);
    // Unknown site: respond without CORS headers so the browser blocks it
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

/**
 * Redirect plain-HTTP requests to HTTPS. Relies on `trust proxy` so that
 * req.secure reflects X-Forwarded-Proto when TLS ends at a proxy.
 * The health check stays reachable over HTTP for load-balancer probes.
 */
export const enforceHttps = (req, res, next) => {
  if (!env.FORCE_HTTPS || req.secure || req.path === '/api/health') return next();

  // Never redirect a non-idempotent request: the body would be lost
  if (!['GET', 'HEAD'].includes(req.method)) {
    return res.status(403).json({ success: false, message: 'HTTPS is required.' });
  }
  return res.redirect(308, `https://${req.hostname}${req.originalUrl}`);
};

export const securityHeaders = helmet({
  // Images served by the API may be embedded by the frontend on another origin
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  strictTransportSecurity: env.HSTS_ENABLED
    ? { maxAge: env.HSTS_MAX_AGE, includeSubDomains: true, preload: env.HSTS_PRELOAD }
    : false,
});

/** Options for the httpOnly refresh-token cookie (also used to clear it) */
export const refreshCookieOptions = (maxAge) => ({
  httpOnly: true,
  secure: env.COOKIE_SECURE,
  sameSite: env.COOKIE_SAME_SITE,
  domain: env.COOKIE_DOMAIN,
  path: '/',
  ...(maxAge ? { maxAge } : {}),
});
