'use strict';

const config = require('../config/env');

/**
 * Standard JSON response envelope.
 * All API responses use this shape: { success, data?, error? }
 */

/**
 * Send a successful response.
 * @param {import('express').Response} res
 * @param {*} data
 * @param {number} [statusCode=200]
 * @param {object} [meta] - Optional metadata (pagination, etc.)
 */
function sendSuccess(res, data, statusCode = 200, meta = null) {
  const body = { success: true, data };
  if (meta) body.meta = meta;
  return res.status(statusCode).json(body);
}

/**
 * Send an error response.
 * @param {import('express').Response} res
 * @param {string} message
 * @param {number} [statusCode=500]
 * @param {*} [details]
 */
function sendError(res, message, statusCode = 500, details = null) {
  const body = { success: false, error: { message } };
  if (details && config.env !== 'production') body.error.details = details;
  return res.status(statusCode).json(body);
}

module.exports = { sendSuccess, sendError };
