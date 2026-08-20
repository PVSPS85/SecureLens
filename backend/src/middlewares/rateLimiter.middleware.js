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
 * Scan rate limiter: Max 5000 scans per hour per IP.
 * Set high to avoid blocking legitimate testing, judging demos, and automated checks.
 */
export const scanLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    status: 429,
    error: 'Too Many Requests',
    message: 'Scan generation limit exceeded. Please try again later.'
  }
});

/**
 * Auth rate limiter: Max 500 attempts per 15 minutes per IP.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500,
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
