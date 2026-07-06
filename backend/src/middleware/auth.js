'use strict';

/**
 * Mock Auth Middleware for Database-Free & Login-Free mode.
 * Bypasses token verification and attaches a mock admin user to all requests.
 */
async function requireAuth(req, res, next) {
  req.user = {
    _id: '60c72b2f9b1d8a001c8e0000', // Mock ObjectId
    name: 'Analyst',
    email: 'analyst@threatlens.local',
    role: 'admin'
  };
  next();
}

function requireRole(...roles) {
  return (req, res, next) => {
    next();
  };
}

module.exports = { requireAuth, requireRole };
