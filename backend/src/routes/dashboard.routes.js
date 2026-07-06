'use strict';

const express = require('express');

const router = express.Router();

// Stub — implemented in Phase 6
router.get('/stats', (req, res) => {
  res.json({ success: true, data: { message: 'Dashboard stats coming in Phase 6' } });
});

module.exports = router;
