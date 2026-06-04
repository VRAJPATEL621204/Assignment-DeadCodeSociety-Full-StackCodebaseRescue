/**
 * Application constants
 * @module utils/constants
 */

/** Shipment status values */
const SHIPMENT_STATUS = {
    PENDING: 'pending',
    IN_PROGRESS: 'in-progress',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled'
};

/** User role values */
const USER_ROLES = {
    USER: 'user',
    ADMIN: 'admin'
};

/** JWT expiration time */
const JWT_EXPIRES_IN = '12h';

/** Bcrypt salt rounds for password hashing */
const BCRYPT_SALT_ROUNDS = 12;

/** API base path */
const API_BASE_PATH = '/api';

module.exports = {
    SHIPMENT_STATUS,
    USER_ROLES,
    JWT_EXPIRES_IN,
    BCRYPT_SALT_ROUNDS,
    API_BASE_PATH
};
