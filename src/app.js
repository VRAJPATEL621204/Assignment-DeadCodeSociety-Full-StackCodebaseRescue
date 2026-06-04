/**
 * LogiTrack Backend Application
 * @module app
 */

require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const routes = require('./routes');
const { globalErrorHandler, notFoundHandler } = require('./middlewares/errorHandler');

const app = express();

/**
 * Connect to MongoDB database
 * @returns {Promise<void>}
 */
async function connectDatabase() {
    const mongoUrl = process.env.DATABASE_URL || 'mongodb://localhost:27017/logitrack';

    try {
        await mongoose.connect(mongoUrl, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
            useFindAndModify: false
        });
        console.log('--- DATABASE CONNECTED ---');
    } catch (err) {
        console.error('DATABASE CONNECTION ERROR:', err);
        process.exit(1);
    }
}

// Initialize database connection
connectDatabase();

// Middleware setup
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Register routes
app.use('/api', routes);

// Welcome route
app.get('/', (req, res) => {
    res.json({
        message: 'LogiTrack Backend running',
        version: '2.0.0',
        documentation: '/api/docs'
    });
});

// Handle undefined routes
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(globalErrorHandler);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is alive on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
