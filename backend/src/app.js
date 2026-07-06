'use strict';

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

const config = require('./config/env');
const corsOptions = require('./config/corsOptions');
const errorHandler = require('./middleware/errorHandler');
const { generalLimiter } = require('./middleware/rateLimit');

// Route modules
const healthRoutes = require('./routes/health.routes');
const authRoutes = require('./routes/auth.routes');
const analyzeRoutes = require('./routes/analyze.routes');
const scansRoutes = require('./routes/scans.routes');
const dashboardRoutes = require('./routes/dashboard.routes');

const app = express();

// ─── Security Headers ─────────────────────────────────────────────────────────
app.use(helmet({
  // Allow inline scripts in development (Vite HMR)
  contentSecurityPolicy: config.env === 'production' ? undefined : false,
}));

// ─── CORS ─────────────────────────────────────────────────────────────────────
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // pre-flight

// ─── Body Parsers ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));          // JSON body; small limit (files go via multer)
app.use(express.urlencoded({ extended: false, limit: '10kb' }));

// ─── Request Logging ─────────────────────────────────────────────────────────
if (config.env !== 'test') {
  app.use(morgan(config.env === 'production' ? 'combined' : 'dev'));
}

// ─── Global Rate Limit ───────────────────────────────────────────────────────
app.use('/api', generalLimiter);

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/analyze', analyzeRoutes);
app.use('/api/scans', scansRoutes);
app.use('/api/dashboard', dashboardRoutes);

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: { message: `Route ${req.method} ${req.originalUrl} not found` },
  });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
// Must be LAST middleware (4-argument signature signals it as error handler to Express)
app.use(errorHandler);

module.exports = app;
