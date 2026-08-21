import ApiError from '../utils/ApiError.js';
import env from '../config/env.js';

/**
 * Global error handling middleware.
 * Catches all errors thrown in route handlers and sends
 * a standardized JSON error response.
 */
const errorHandler = (err, req, res, _next) => {
  let error = err;

  // If it's not an ApiError, wrap it
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';
    error = new ApiError(statusCode, message, [], err.stack);
  }

  const response = {
    success: false,
    message: error.message,
    ...(error.errors.length > 0 && { errors: error.errors }),
    ...(env.isDev && { stack: error.stack }),
  };

  // Log error in development
  if (env.isDev) {
    console.error(`❌ [${error.statusCode}] ${error.message}`);
    if (error.stack) {
      console.error(error.stack);
    }
  }

  return res.status(error.statusCode).json(response);
};

export default errorHandler;
