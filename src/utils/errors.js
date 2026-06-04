/**
 * Custom error classes for centralized error handling
 * @module utils/errors
 */

/**
 * Base application error class
 * @extends Error
 */
class AppError extends Error {
    /**
     * Create an AppError
     * @param {string} message - Error message
     * @param {number} statusCode - HTTP status code
     */
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Error for bad requests (400)
 * @extends AppError
 */
class BadRequestError extends AppError {
    /**
     * Create a BadRequestError
     * @param {string} [message='Bad Request'] - Error message
     */
    constructor(message = 'Bad Request') {
        super(message, 400);
    }
}

/**
 * Error for unauthorized access (401)
 * @extends AppError
 */
class UnauthorizedError extends AppError {
    /**
     * Create an UnauthorizedError
     * @param {string} [message='Unauthorized'] - Error message
     */
    constructor(message = 'Unauthorized') {
        super(message, 401);
    }
}

/**
 * Error for forbidden access (403)
 * @extends AppError
 */
class ForbiddenError extends AppError {
    /**
     * Create a ForbiddenError
     * @param {string} [message='Forbidden'] - Error message
     */
    constructor(message = 'Forbidden') {
        super(message, 403);
    }
}

/**
 * Error for not found resources (404)
 * @extends AppError
 */
class NotFoundError extends AppError {
    /**
     * Create a NotFoundError
     * @param {string} [message='Not Found'] - Error message
     */
    constructor(message = 'Not Found') {
        super(message, 404);
    }
}

/**
 * Error for conflict (409)
 * @extends AppError
 */
class ConflictError extends AppError {
    /**
     * Create a ConflictError
     * @param {string} [message='Conflict'] - Error message
     */
    constructor(message = 'Conflict') {
        super(message, 409);
    }
}

module.exports = {
    AppError,
    BadRequestError,
    UnauthorizedError,
    ForbiddenError,
    NotFoundError,
    ConflictError
};
