'use strict';

const config = require('../config/env');
const { ApiError } = require('../utils/errors');

/**
 * Global Express error-handling middleware.
 * Must be registered LAST — after all routes.
 * Normalizes all error types into the standard { success, error } envelope.
 *
 * @param {Error} err
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next  // must be 4-arg even if unused
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // Determine HTTP status code
  let statusCode = err.statusCode || 500;

  // Mongoose validation errors → 422
  if (err.name === 'ValidationError' && !err.statusCode) {
    statusCode = 422;
  }

  // JWT errors → 401
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    statusCode = 401;
  }

  // Mongoose CastError (bad ObjectId) → 404
  if (err.name === 'CastError') {
    statusCode = 404;
    err.message = 'Resource not found (invalid ID format)';
  }

  // Mongoose duplicate-key → 409
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    err.message = `Duplicate value for ${field}`;
  }

  const body = {
    success: false,
    error: {
      message: err.message || 'Internal Server Error',
    },
  };

  // Include stack trace and details only outside production
  if (config.env !== 'production') {
    if (err.details) body.error.details = err.details;
    body.error.stack = err.stack;
  }

  // Always log 5xx errors
  if (statusCode >= 500) {
    console.error('[errorHandler]', {
      method: req.method,
      url: req.originalUrl,
      statusCode,
      message: err.message,
      stack: err.stack,
    });
  }

  return res.status(statusCode).json(body);
}

module.exports = errorHandler;
