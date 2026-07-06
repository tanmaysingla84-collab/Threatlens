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

    // Allow any localhost/127.0.0.1 origin in development
    if (config.env === 'development' && origin && (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:'))) {
      return callback(null, true);
    }

    if (config.cors.allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin '${origin}' is not allowed`));
    }
  },
  credentials: true,                 // allow cookies / auth headers
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['X-Total-Count'],  // useful for pagination
  maxAge: 600,                        // pre-flight cache 10 min
};

module.exports = corsOptions;
