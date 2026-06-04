/**
 * Authentication service - business logic for user auth
 * @module services/authService
 */

const User = require('../../models/User');
const { hashPassword, comparePassword } = require('../utils/password');
const { ConflictError, UnauthorizedError, BadRequestError } = require('../utils/errors');

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @param {string} userData.name - User's name
 * @param {string} userData.email - User's email
 * @param {string} userData.password - User's password
 * @param {string} [userData.role='user'] - User's role
 * @returns {Promise<Object>} Created user object (without password)
 * @throws {ConflictError} If email already exists
 * @throws {BadRequestError} If validation fails
 */
async function register(userData) {
    const { name, email, password, role = 'user' } = userData;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new ConflictError('Email already registered');
    }

    // Hash password with bcrypt
    const hashedPassword = await hashPassword(password);

    // Create new user
    const newUser = new User({
        name,
        email,
        password: hashedPassword,
        role
    });

    const savedUser = await newUser.save();

    // Return user without password
    return {
        id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
        role: savedUser.role,
        createdAt: savedUser.createdAt
    };
}

/**
 * Authenticate user and return user data
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Promise<Object>} User object if authenticated
 * @throws {UnauthorizedError} If credentials are invalid
 */
async function login(email, password) {
    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
        throw new UnauthorizedError('Invalid credentials');
    }

    // Compare password using bcrypt (constant-time comparison)
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
        throw new UnauthorizedError('Invalid credentials');
    }

    // Return user without password
    return {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
    };
}

/**
 * Get user profile by ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User object
 * @throws {NotFoundError} If user not found
 */
async function getProfile(userId) {
    const { NotFoundError } = require('../utils/errors');
    
    const user = await User.findById(userId).select('-password');

    if (!user) {
        throw new NotFoundError('User not found');
    }

    return user;
}

module.exports = {
    register,
    login,
    getProfile
};
