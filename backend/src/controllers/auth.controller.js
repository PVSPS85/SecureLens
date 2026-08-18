import logger from '../utils/logger.js';

/**
 * Controller handlers for auth login and signup pathways.
 */

/**
 * Performs mock account authentication and resolves security tokens.
 */
export const login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        status: 400,
        error: 'Bad Request',
        message: 'Email and password are required parameters.'
      });
    }

    // STRICT PRIVACY SECURITY CONSTRAINT: Never print/log plain-text passwords
    logger.info(`[Auth Controller] Login attempt initiated for user: ${email}`);

    // Emulate mock credential checks
    if (password === 'invalid-password') {
      return res.status(401).json({
        success: false,
        status: 401,
        error: 'Unauthorized',
        message: 'Authentication failed. Invalid email or password credentials.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User authenticated successfully.',
      data: {
        accessToken: 'Bearer-mock-jwt-token-xyz-123',
        user: {
          id: 'user-uuid-1111-2222-3333-mock',
          email: email
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Performs mock account registration.
 */
export const signup = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        status: 400,
        error: 'Bad Request',
        message: 'Email and password fields are required to create an account.'
      });
    }

    // STRICT PRIVACY SECURITY CONSTRAINT: Never print/log plain-text passwords
    logger.info(`[Auth Controller] Signup registration processed for: ${email}`);

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      data: {
        user: {
          id: 'user-uuid-1111-2222-3333-mock',
          email: email
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export default {
  login,
  signup
};
