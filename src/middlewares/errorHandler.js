/**
 * Centralized error handling middleware
 * @module middlewares/errorHandler
 */

const { AppError } = require('../utils/errors');

/**
 * Global error handler middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
function globalErrorHandler(err, req, res, next) {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    // Log error for debugging
    console.error('ERROR:', {
        message: err.message,
        statusCode: err.statusCode,
        stack: err.stack,
        path: req.path,
        method: req.method
    });

    // Operational, trusted error: send message to client
    if (err.isOperational) {
        return res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        });
    }

    // Programming or other unknown error: don't leak error details
    return res.status(500).json({
        status: 'error',
        message: 'Something went wrong'
    });
}

/**
 * Handle 404 errors for undefined routes
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
function notFoundHandler(req, res) {
    res.status(404).json({
        status: 'fail',
        message: `Cannot find ${req.originalUrl} on this server`
    });
}

/**
 * Async handler wrapper to catch errors in async route handlers
 * @param {Function} fn - Async route handler function
 * @returns {Function} Express middleware function
 */
function asyncHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}

module.exports = {
    globalErrorHandler,
    notFoundHandler,
    asyncHandler
};
