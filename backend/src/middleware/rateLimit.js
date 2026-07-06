'use strict';

const rateLimit = require('express-rate-limit');

/**
 * General API rate limiter: 100 requests per 15 minutes per IP.
 * Applied globally to all /api/* routes.
 */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,   // Return rate limit info in X-RateLimit-* headers
  legacyHeaders: false,
  message: {
    success: false,
    error: { message: 'Too many requests, please try again later.' },
  },
});

/**
 * Strict limiter for auth endpoints (login, register, forgot-password).
 * 10 requests per 15 minutes per IP.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { message: 'Too many authentication attempts, please try again later.' },
  },
});

/**
 * Limiter for analysis endpoints (heavier workloads hitting external APIs).
 * 20 requests per 5 minutes per IP.
 */
const analysisLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { message: 'Analysis rate limit exceeded, please wait before submitting again.' },
  },
});

module.exports = { generalLimiter, authLimiter, analysisLimiter };
