/**
 * Password hashing utilities using bcrypt
 * @module utils/password
 */

const bcrypt = require('bcrypt');
const { BCRYPT_SALT_ROUNDS } = require('./constants');

/**
 * Hash a password using bcrypt
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Hashed password
 * @throws {Error} If password is invalid or hashing fails
 */
async function hashPassword(password) {
    if (!password || typeof password !== 'string') {
        throw new Error('Password must be a non-empty string');
    }
    return bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
}

/**
 * Compare a plain text password with a hashed password
 * Uses constant-time comparison to prevent timing attacks
 * @param {string} password - Plain text password
 * @param {string} hashedPassword - Bcrypt hashed password
 * @returns {Promise<boolean>} True if passwords match
 * @throws {Error} If comparison fails
 */
async function comparePassword(password, hashedPassword) {
    if (!password || !hashedPassword) {
        return false;
    }
    return bcrypt.compare(password, hashedPassword);
}

module.exports = {
    hashPassword,
    comparePassword
};
