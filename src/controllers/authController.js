/**
 * Authentication controller - HTTP handlers for auth routes
 * @module controllers/authController
 */

const jwt = require('jsonwebtoken');
const authService = require('../services/authService');
const { JWT_EXPIRES_IN } = require('../utils/constants');
const { asyncHandler } = require('../middlewares/errorHandler');

/**
 * JWT secret from environment
 * @constant {string}
 */
const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Generate JWT token for user
 * @param {Object} user - User object
 * @returns {string} JWT token
 */
function generateToken(user) {
    if (!JWT_SECRET) {
        throw new Error('JWT_SECRET environment variable is not configured');
    }

    return jwt.sign(
        { id: user.id, role: user.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );
}

/**
 * Register a new user
 * @route POST /api/register
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Created user object
 */
const register = asyncHandler(async (req, res) => {
    const user = await authService.register(req.body);

    res.status(201).json({
        success: true,
        message: 'Account created successfully',
        user
    });
});

/**
 * Login user and return token
 * @route POST /api/login
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} User data and JWT token
 */
const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await authService.login(email, password);
    const token = generateToken(user);

    res.json({
        success: true,
        message: 'Login successful',
        token,
        data: user
    });
});

/**
 * Get current user profile
 * @route GET /api/profile
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} User profile
 */
const getProfile = asyncHandler(async (req, res) => {
    const user = await authService.getProfile(req.userId);

    res.json({
        success: true,
        data: user
    });
});

module.exports = {
    register,
    login,
    getProfile
};
