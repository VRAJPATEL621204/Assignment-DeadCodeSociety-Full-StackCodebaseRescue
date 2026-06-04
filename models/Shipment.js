/**
 * Shipment model
 * @module models/Shipment
 */

const mongoose = require('mongoose');

/**
 * Shipment status values
 * @constant {string[]}
 */
const STATUS_VALUES = ['pending', 'in-progress', 'delivered', 'cancelled'];

/**
 * Shipment schema definition
 * @constant {mongoose.Schema}
 */
const shipmentSchema = new mongoose.Schema({
    trackingId: {
        type: String,
        required: [true, 'Tracking ID is required'],
        unique: true,
        index: true
    },
    origin: {
        type: String,
        required: [true, 'Origin is required'],
        trim: true
    },
    destination: {
        type: String,
        required: [true, 'Destination is required'],
        trim: true
    },
    status: {
        type: String,
        enum: STATUS_VALUES,
        default: 'pending'
    },
    weight: {
        type: Number,
        required: [true, 'Weight is required'],
        min: [0, 'Weight must be positive']
    },
    carrier: {
        type: String,
        required: [true, 'Carrier is required'],
        trim: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required'],
        index: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

/**
 * Pre-save hook to update the updatedAt timestamp
 * @param {Function} next - Mongoose next middleware function
 */
shipmentSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

/**
 * Shipment model
 * @type {mongoose.Model}
 */
const Shipment = mongoose.model('Shipment', shipmentSchema);

module.exports = Shipment;
