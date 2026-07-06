'use strict';

/**
 * setup.routes.js — login-free stub
 * Admin setup is not needed since auth is disabled.
 */

const express = require('express');
const router = express.Router();

router.post('/admin', (req, res) => {
  res.json({ success: true, data: { message: 'Auth is disabled. Setup not required.' } });
});

module.exports = router;
