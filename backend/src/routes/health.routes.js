'use strict';

/**
 * health.routes.js — database-free version
 * Returns server status without any mongoose dependency.
 */

const express = require('express');
const { sendSuccess } = require('../utils/response');

const router = express.Router();

/**
 * GET /api/health
 * Public endpoint — returns server status.
 */
router.get('/', (req, res) => {
  return sendSuccess(res, {
    server: 'ok',
    db: 'stateless',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  });
});

module.exports = router;
