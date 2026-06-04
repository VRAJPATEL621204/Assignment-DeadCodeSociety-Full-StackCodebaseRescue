/**
 * Authentication routes
 * @module routes/authRoutes
 */

const express = require('express');
const authController = require('../controllers/authController');
const { authenticate } = require('../middlewares/auth');
const { validate } = require('../validators');
const { registerSchema, loginSchema } = require('../validators');

const router = express.Router();

/**
 * @route POST /api/register
 * @desc Register a new user
 * @access Public
 */
router.post('/register', validate(registerSchema), authController.register);

/**
 * @route POST /api/login
 * @desc Login user and get token
 * @access Public
 */
router.post('/login', validate(loginSchema), authController.login);

/**
 * @route GET /api/profile
 * @desc Get current user profile
 * @access Private
 */
router.get('/profile', authenticate, authController.getProfile);

module.exports = router;
