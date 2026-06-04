/**
 * Shipment routes
 * @module routes/shipmentRoutes
 */

const express = require('express');
const shipmentController = require('../controllers/shipmentController');
const { authenticate } = require('../middlewares/auth');
const { validate, validateParams } = require('../validators');
const { createShipmentSchema, updateStatusSchema, objectIdSchema } = require('../validators');

const router = express.Router();

// All shipment routes require authentication
router.use(authenticate);

/**
 * @route GET /api/shipments
 * @desc Get all shipments for user
 * @access Private
 */
router.get('/', shipmentController.getShipments);

/**
 * @route GET /api/shipments/:id
 * @desc Get a single shipment by ID
 * @access Private
 */
router.get('/:id', validateParams(objectIdSchema), shipmentController.getShipmentById);

/**
 * @route POST /api/shipments
 * @desc Create a new shipment
 * @access Private
 */
router.post('/', validate(createShipmentSchema), shipmentController.createShipment);

/**
 * @route PATCH /api/shipments/:id/status
 * @desc Update shipment status
 * @access Private (Admin for 'delivered' status)
 */
router.patch(
    '/:id/status',
    validateParams(objectIdSchema),
    validate(updateStatusSchema),
    shipmentController.updateStatus
);

/**
 * @route DELETE /api/shipments/:id
 * @desc Delete a shipment
 * @access Private (Owner or Admin)
 */
router.delete('/:id', validateParams(objectIdSchema), shipmentController.deleteShipment);

module.exports = router;
