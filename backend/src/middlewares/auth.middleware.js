import logger from '../utils/logger.js';

/**
 * Authentication middleware verification boundary.
 * Looks for Bearer token in the Authorization header.
 */
export const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    logger.warn(`[Auth Middleware] Authorization header missing or malformed.`);
    return res.status(401).json({
      success: false,
      status: 401,
      error: 'Unauthorized',
      message: 'Access denied. Missing or malformed authentication token.'
    });
  }

  const token = authHeader.split(' ')[1];

  // Emulate invalid token checks
  if (token === 'invalid-token-value') {
    logger.warn(`[Auth Middleware] Received invalid or blacklisted token.`);
    return res.status(401).json({
      success: false,
      status: 401,
      error: 'Unauthorized',
      message: 'Access denied. The provided authentication token is invalid or has expired.'
    });
  }

  // Inject mock authenticated user details into request context
  req.user = {
    id: 'user-uuid-1111-2222-3333-mock',
    email: 'mock-user@securelens.org'
  };

  logger.info(`[Auth Middleware] Access authorized for user ID: ${req.user.id}`);
  next();
};

export default {
  requireAuth
};
