import logger from '../utils/logger.js';

/**
 * Custom operational API Error class
 */
export class ApiError extends Error {
  constructor(statusCode, message, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Catch-all middleware for 404 Not Found errors
 */
export const notFoundHandler = (req, res, next) => {
  const error = new ApiError(
    404,
    `Cannot ${req.method} ${req.originalUrl} - Route not found`
  );
  next(error);
};

/**
 * Centralized global error handling middleware
 * Strips all internal stack traces to clients, logging details internally.
 */
export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const isOperational = err.isOperational || false;

  // Set message based on status code and environment
  let message = err.message;
  if (statusCode === 500 && process.env.NODE_ENV === 'production') {
    message = 'An unexpected internal server error occurred.';
  }

  // Log error stack internally
  logger.error(`${err.message} - Method: ${req.method} - URL: ${req.originalUrl} - IP: ${req.ip}`, err);

  res.status(statusCode).json({
    success: false,
    status: statusCode,
    error: statusCode === 404 ? 'Not Found' : 'Internal Server Error',
    message: message
  });
};
