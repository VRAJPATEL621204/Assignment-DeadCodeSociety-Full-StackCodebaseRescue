/**
 * Shipment controller - HTTP handlers for shipment routes
 * @module controllers/shipmentController
 */

const shipmentService = require('../services/shipmentService');
const { asyncHandler } = require('../middlewares/errorHandler');

/**
 * Get all shipments for authenticated user
 * @route GET /api/shipments
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} List of shipments
 */
const getShipments = asyncHandler(async (req, res) => {
    const shipments = await shipmentService.getUserShipments(req.userId, req.userRole);

    res.json({
        status: 'success',
        results: shipments.length,
        data: shipments
    });
});

/**
 * Get a single shipment by ID
 * @route GET /api/shipments/:id
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Shipment details
 */
const getShipmentById = asyncHandler(async (req, res) => {
    const shipment = await shipmentService.getShipmentById(
        req.params.id,
        req.userId,
        req.userRole
    );

    res.json({
        status: 'success',
        data: shipment
    });
});

/**
 * Create a new shipment
 * @route POST /api/shipments
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Created shipment
 */
const createShipment = asyncHandler(async (req, res) => {
    const shipment = await shipmentService.createShipment(req.body, req.userId);

    res.status(201).json({
        status: 'success',
        data: shipment
    });
});

/**
 * Update shipment status
 * @route PATCH /api/shipments/:id/status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Updated shipment
 */
const updateStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;

    const shipment = await shipmentService.updateShipmentStatus(
        req.params.id,
        status,
        req.userRole
    );

    res.json({
        status: 'success',
        data: shipment
    });
});

/**
 * Delete a shipment
 * @route DELETE /api/shipments/:id
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Success message
 */
const deleteShipment = asyncHandler(async (req, res) => {
    await shipmentService.deleteShipment(req.params.id, req.userId, req.userRole);

    res.json({
        status: 'success',
        message: `Deleted shipment ${req.params.id}`
    });
});

module.exports = {
    getShipments,
    getShipmentById,
    createShipment,
    updateStatus,
    deleteShipment
};
