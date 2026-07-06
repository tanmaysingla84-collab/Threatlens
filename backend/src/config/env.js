'use strict';

const dotenv = require('dotenv');
const path = require('path');

// Load .env from the backend root (one level up from src/)
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

/**
 * Central config object — single source of truth for all env-driven settings.
 * Any missing required variable is caught early with a clear error message.
 */

function required(name) {
  const val = process.env[name];
  if (!val) {
    throw new Error(`[env] Missing required environment variable: ${name}`);
  }
  return val;
}

function optional(name, defaultValue = '') {
  return process.env[name] || defaultValue;
}

const config = {
  env: optional('NODE_ENV', 'development'),
  port: parseInt(optional('PORT', '5000'), 10),

  db: {
    uri: optional('MONGODB_URI', 'mongodb://127.0.0.1:27017/threatlens'),
  },

  jwt: {
    accessSecret: optional('JWT_ACCESS_SECRET', 'dev_access_secret_please_change'),
    refreshSecret: optional('JWT_REFRESH_SECRET', 'dev_refresh_secret_please_change'),
    accessExpiresIn: optional('JWT_ACCESS_EXPIRES_IN', '15m'),
    refreshExpiresIn: optional('JWT_REFRESH_EXPIRES_IN', '7d'),
  },

  cors: {
    allowedOrigins: optional('ALLOWED_ORIGINS', 'http://localhost:5173,http://localhost:3000')
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean),
  },

  email: {
    host: optional('SMTP_HOST'),
    port: parseInt(optional('SMTP_PORT', '587'), 10),
    user: optional('SMTP_USER'),
    pass: optional('SMTP_PASS'),
    from: optional('EMAIL_FROM', 'no-reply@threatlens.local'),
  },

  apis: {
    virusTotal: optional('VIRUSTOTAL_API_KEY'),
    malwareBazaar: optional('MALWAREBAZAAR_API_KEY'),
    hybridAnalysis: optional('HYBRID_ANALYSIS_API_KEY'),
    urlScan: optional('URLSCAN_API_KEY'),
    abuseIpdb: optional('ABUSEIPDB_API_KEY'),
  },

  ai: {
    provider: optional('AI_PROVIDER', 'template'),
    openaiKey: optional('OPENAI_API_KEY'),
    anthropicKey: optional('ANTHROPIC_API_KEY'),
  },

  upload: {
    maxFileSizeMb: parseInt(optional('MAX_FILE_SIZE_MB', '32'), 10),
    dir: optional('UPLOAD_DIR', './uploads'),
  },
};

module.exports = config;
