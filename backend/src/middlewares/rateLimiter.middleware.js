import rateLimit from 'express-rate-limit';

/**
 * Global rate limiter: Max 5000 requests per 15 minutes per IP.
 */
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    status: 429,
    error: 'Too Many Requests',
    message: 'Global request rate limit exceeded. Please try again after 15 minutes.'
  }
});

/**
 * Strict scan rate limiter: Max 10 scans per 1 hour per IP.
 * Used on target scanning endpoints to prevent API abuse and DoS.
 */
export const scanLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    status: 429,
    error: 'Too Many Requests',
    message: 'Scan generation limit exceeded. You can perform up to 10 scans per hour.'
  }
});

/**
 * Strict auth rate limiter: Max 10 attempts per 15 minutes per IP.
 * Protects login and signup against brute-force attacks.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    status: 429,
    error: 'Too Many Requests',
    message: 'Too many authentication attempts. Please try again after 15 minutes.'
  }
});

export default {
  globalLimiter,
  scanLimiter,
  authLimiter
};
