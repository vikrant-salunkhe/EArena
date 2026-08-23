const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

const app = express();

// Security Middleware
app.use(helmet());
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
}));

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // Limit each IP to 100 requests per `window`
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api', limiter);

// Body Parsers & Cookie Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Basic Health Check Route
app.get('/api/v1/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'EArena API is running'
    });
});

// API Routes
const routes = require('./routes');
app.use('/api/v1', routes);

// 404 Handler
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || 'Internal Server Error'
    });
});

module.exports = app;
