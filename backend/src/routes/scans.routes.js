'use strict';

const express = require('express');

const router = express.Router();

// Stub — implemented in Phase 4
router.get('/', (req, res) => {
  res.json({ success: true, data: { message: 'Scan history coming in Phase 4' } });
});

module.exports = router;
