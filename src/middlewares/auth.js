/**
 * Authentication middleware
 * @module middlewares/auth
 */

const jwt = require('jsonwebtoken');
const { UnauthorizedError } = require('../utils/errors');

/**
 * JWT secret from environment
 * @constant {string}
 */
const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Verify JWT token and attach user info to request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @throws {UnauthorizedError} If token is missing or invalid
 */
function authenticate(req, res, next) {
    if (!JWT_SECRET) {
        throw new Error('JWT_SECRET environment variable is not configured');
    }

    const token = req.headers['authorization'];

    if (!token) {
        return next(new UnauthorizedError('Missing token'));
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return next(new UnauthorizedError('Invalid token'));
        }

        req.userId = decoded.id;
        req.userRole = decoded.role;
        next();
    });
}

/**
 * Require admin role for access
 * Must be used after authenticate middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @throws {ForbiddenError} If user is not an admin
 */
function requireAdmin(req, res, next) {
    const { USER_ROLES } = require('../utils/constants');
    
    if (req.userRole !== USER_ROLES.ADMIN) {
        const { ForbiddenError } = require('../utils/errors');
        return next(new ForbiddenError('Admin access required'));
    }
    next();
}

module.exports = {
    authenticate,
    requireAdmin
};
