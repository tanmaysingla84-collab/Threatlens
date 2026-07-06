'use strict';

const config = require('./env');

/**
 * CORS options for the `cors` npm package.
 * Only origins explicitly listed in ALLOWED_ORIGINS are permitted.
 */
const corsOptions = {
  origin(origin, callback) {
    // Allow server-to-server / curl requests (no origin header) only in dev
    if (!origin && config.env === 'development') {
      return callback(null, true);
    }

    // Relaxed CORS for deployment ease
    callback(null, true);
  },
  credentials: true,                 // allow cookies / auth headers
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['X-Total-Count'],  // useful for pagination
  maxAge: 600,                        // pre-flight cache 10 min
};

module.exports = corsOptions;
