'use strict';

/**
 * auth.routes.js — login-free stub
 * Authentication is disabled. All routes return no-op responses.
 * The frontend is configured with a hardcoded analyst user and needs no auth.
 */

const express = require('express');
const router = express.Router();

const MOCK_USER = {
  _id: 'local-analyst',
  name: 'Analyst',
  email: 'analyst@threatlens.local',
  role: 'admin',
  lastLogin: null,
  createdAt: new Date().toISOString(),
};

// All auth endpoints are stubs — login is not required
router.post('/register',        (req, res) => res.json({ success: true, data: { user: MOCK_USER } }));
router.post('/login',           (req, res) => res.json({ success: true, data: { user: MOCK_USER, accessToken: 'n/a', refreshToken: 'n/a' } }));
router.post('/forgot-password', (req, res) => res.json({ success: true, data: { message: 'Auth disabled.' } }));
router.post('/reset-password',  (req, res) => res.json({ success: true, data: { message: 'Auth disabled.' } }));
router.post('/refresh',         (req, res) => res.json({ success: true, data: { accessToken: 'n/a' } }));
router.get('/me',               (req, res) => res.json({ success: true, data: MOCK_USER }));

module.exports = router;
