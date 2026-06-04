/**
 * Main router - combines all route modules
 * @module routes/index
 */

const express = require('express');
const authRoutes = require('./authRoutes');
const shipmentRoutes = require('./shipmentRoutes');
const statusRoutes = require('./statusRoutes');

const router = express.Router();

// Mount route modules
router.use('/', authRoutes);
router.use('/shipments', shipmentRoutes);
router.use('/', statusRoutes);

module.exports = router;
