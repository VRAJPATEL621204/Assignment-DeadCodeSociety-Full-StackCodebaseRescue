/**
 * Joi validation schemas and middleware
 * @module validators
 */

const Joi = require('joi');
const { BadRequestError } = require('../utils/errors');

/**
 * User registration validation schema
 * @constant {Joi.ObjectSchema}
 */
const registerSchema = Joi.object({
    name: Joi.string().min(2).max(100).required()
        .messages({
            'string.min': 'Name must be at least 2 characters',
            'string.max': 'Name cannot exceed 100 characters',
            'any.required': 'Name is required'
        }),
    email: Joi.string().email().required()
        .messages({
            'string.email': 'Please provide a valid email',
            'any.required': 'Email is required'
        }),
    password: Joi.string().min(8).required()
        .messages({
            'string.min': 'Password must be at least 8 characters',
            'any.required': 'Password is required'
        }),
    role: Joi.string().valid('user', 'admin').optional()
        .messages({
            'any.only': 'Role must be either user or admin'
        })
});

/**
 * User login validation schema
 * @constant {Joi.ObjectSchema}
 */
const loginSchema = Joi.object({
    email: Joi.string().email().required()
        .messages({
            'string.email': 'Please provide a valid email',
            'any.required': 'Email is required'
        }),
    password: Joi.string().required()
        .messages({
            'any.required': 'Password is required'
        })
});

/**
 * Shipment creation validation schema
 * @constant {Joi.ObjectSchema}
 */
const createShipmentSchema = Joi.object({
    origin: Joi.string().min(2).max(200).required()
        .messages({
            'string.min': 'Origin must be at least 2 characters',
            'string.max': 'Origin cannot exceed 200 characters',
            'any.required': 'Origin is required'
        }),
    destination: Joi.string().min(2).max(200).required()
        .messages({
            'string.min': 'Destination must be at least 2 characters',
            'string.max': 'Destination cannot exceed 200 characters',
            'any.required': 'Destination is required'
        }),
    weight: Joi.number().positive().required()
        .messages({
            'number.positive': 'Weight must be a positive number',
            'any.required': 'Weight is required'
        }),
    carrier: Joi.string().min(2).max(100).required()
        .messages({
            'string.min': 'Carrier must be at least 2 characters',
            'string.max': 'Carrier cannot exceed 100 characters',
            'any.required': 'Carrier is required'
        })
});

/**
 * Shipment status update validation schema
 * @constant {Joi.ObjectSchema}
 */
const updateStatusSchema = Joi.object({
    status: Joi.string().valid('pending', 'in-progress', 'delivered', 'cancelled').required()
        .messages({
            'any.only': 'Status must be pending, in-progress, delivered, or cancelled',
            'any.required': 'Status is required'
        })
});

/**
 * Object ID validation schema
 * @constant {Joi.ObjectSchema}
 */
const objectIdSchema = Joi.object({
    id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required()
        .messages({
            'string.pattern.base': 'Invalid ID format',
            'any.required': 'ID is required'
        })
});

/**
 * Create validation middleware from schema
 * @param {Joi.ObjectSchema} schema - Joi schema to validate against
 * @returns {Function} Express middleware function
 */
function validate(schema) {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            const message = error.details.map(detail => detail.message).join(', ');
            return next(new BadRequestError(message));
        }

        // Replace req.body with validated/sanitized data
        req.body = value;
        next();
    };
}

/**
 * Validate route parameters
 * @param {Joi.ObjectSchema} schema - Joi schema for params
 * @returns {Function} Express middleware function
 */
function validateParams(schema) {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.params, {
            abortEarly: false
        });

        if (error) {
            const message = error.details.map(detail => detail.message).join(', ');
            return next(new BadRequestError(message));
        }

        req.params = value;
        next();
    };
}

module.exports = {
    registerSchema,
    loginSchema,
    createShipmentSchema,
    updateStatusSchema,
    objectIdSchema,
    validate,
    validateParams
};
