/**
 * System status routes
 * @module routes/statusRoutes
 */

const express = require('express');
const statusController = require('../controllers/statusController');

const router = express.Router();

/**
 * @route GET /api/status
 * @desc Get system status information
 * @access Public
 */
router.get('/status', statusController.getStatus);

/**
 * @route GET /api/ping
 * @desc Health check endpoint
 * @access Public
 */
router.get('/ping', statusController.ping);

module.exports = router;
