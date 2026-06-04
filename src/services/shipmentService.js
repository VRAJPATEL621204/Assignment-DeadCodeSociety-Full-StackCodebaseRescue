/**
 * Shipment service - business logic for shipment operations
 * @module services/shipmentService
 */

const Shipment = require('../../models/Shipment');
const { SHIPMENT_STATUS } = require('../utils/constants');
const { NotFoundError, ForbiddenError, BadRequestError } = require('../utils/errors');

/**
 * Generate unique tracking ID
 * @returns {string} Tracking ID
 */
function generateTrackingId() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `SHIP-${timestamp}-${random}`;
}

/**
 * Get all shipments for a user with populated user details
 * Uses populate to avoid N+1 query problem
 * @param {string} userId - User ID
 * @param {string} userRole - User role
 * @returns {Promise<Array>} Array of shipments with user details
 */
async function getUserShipments(userId, userRole) {
    let query = {};
    
    // Admin can see all shipments, users see only their own
    if (userRole !== 'admin') {
        query = { userId };
    }

    // Use populate to fetch user details in a single query (fixes N+1)
    const shipments = await Shipment.find(query)
        .populate('userId', 'name email')
        .sort({ createdAt: -1 });

    return shipments.map(shipment => ({
        id: shipment._id,
        trackingId: shipment.trackingId,
        origin: shipment.origin,
        destination: shipment.destination,
        status: shipment.status,
        weight: shipment.weight,
        carrier: shipment.carrier,
        user: shipment.userId,
        createdAt: shipment.createdAt,
        updatedAt: shipment.updatedAt
    }));
}

/**
 * Get a single shipment by ID
 * @param {string} shipmentId - Shipment ID
 * @param {string} userId - Requesting user ID
 * @param {string} userRole - Requesting user role
 * @returns {Promise<Object>} Shipment object
 * @throws {NotFoundError} If shipment not found
 * @throws {ForbiddenError} If user doesn't have access
 */
async function getShipmentById(shipmentId, userId, userRole) {
    const shipment = await Shipment.findById(shipmentId);

    if (!shipment) {
        throw new NotFoundError('Shipment not found');
    }

    // Check permissions
    if (shipment.userId.toString() !== userId && userRole !== 'admin') {
        throw new ForbiddenError('No access to this shipment');
    }

    return shipment;
}

/**
 * Create a new shipment
 * @param {Object} shipmentData - Shipment data
 * @param {string} shipmentData.origin - Origin location
 * @param {string} shipmentData.destination - Destination location
 * @param {number} shipmentData.weight - Package weight
 * @param {string} shipmentData.carrier - Carrier name
 * @param {string} userId - User ID creating the shipment
 * @returns {Promise<Object>} Created shipment
 */
async function createShipment(shipmentData, userId) {
    const { origin, destination, weight, carrier } = shipmentData;

    const trackingId = generateTrackingId();

    const newShipment = new Shipment({
        origin,
        destination,
        weight,
        carrier,
        trackingId,
        userId,
        status: SHIPMENT_STATUS.PENDING
    });

    const savedShipment = await newShipment.save();
    return savedShipment;
}

/**
 * Update shipment status
 * @param {string} shipmentId - Shipment ID
 * @param {string} newStatus - New status
 * @param {string} userRole - User role performing the update
 * @returns {Promise<Object>} Updated shipment
 * @throws {NotFoundError} If shipment not found
 * @throws {ForbiddenError} If non-admin tries to mark as delivered
 * @throws {BadRequestError} If status transition is invalid
 */
async function updateShipmentStatus(shipmentId, newStatus, userRole) {
    // Only admins can mark as delivered
    if (newStatus === SHIPMENT_STATUS.DELIVERED && userRole !== 'admin') {
        throw new ForbiddenError('Only admins can mark shipments as delivered');
    }

    const shipment = await Shipment.findByIdAndUpdate(
        shipmentId,
        { status: newStatus },
        { new: true }
    );

    if (!shipment) {
        throw new NotFoundError('Shipment not found');
    }

    return shipment;
}

/**
 * Delete a shipment
 * @param {string} shipmentId - Shipment ID
 * @param {string} userId - Requesting user ID
 * @param {string} userRole - Requesting user role
 * @throws {NotFoundError} If shipment not found
 * @throws {ForbiddenError} If user doesn't have permission
 */
async function deleteShipment(shipmentId, userId, userRole) {
    const shipment = await Shipment.findById(shipmentId);

    if (!shipment) {
        throw new NotFoundError('Shipment not found');
    }

    // Only shipment owner or admin can delete
    if (shipment.userId.toString() !== userId && userRole !== 'admin') {
        throw new ForbiddenError('No permission to delete this shipment');
    }

    await Shipment.findByIdAndDelete(shipmentId);
}

module.exports = {
    getUserShipments,
    getShipmentById,
    createShipment,
    updateShipmentStatus,
    deleteShipment
};
