/**
 * Status controller - system health and status endpoints
 * @module controllers/statusController
 */

const os = require('os');
const { asyncHandler } = require('../middlewares/errorHandler');

/**
 * Get system status information
 * @route GET /api/status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} System status information
 */
const getStatus = asyncHandler(async (req, res) => {
    const info = {
        os: os.type(),
        release: os.release(),
        uptime: process.uptime(),
        memory: process.memoryUsage().rss,
        nodeVersion: process.version,
        timestamp: new Date().toISOString()
    };

    res.json({
        status: 'success',
        data: info
    });
});

/**
 * Simple ping endpoint for health checks
 * @route GET /api/ping
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Pong response
 */
const ping = asyncHandler(async (req, res) => {
    res.json({
        status: 'success',
        pong: 'active',
        timestamp: new Date().toISOString()
    });
});

module.exports = {
    getStatus,
    ping
};
