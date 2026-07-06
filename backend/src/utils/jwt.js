'use strict';

const jwt = require('jsonwebtoken');
const config = require('../config/env');

/**
 * JWT utility — all token signing and verification is centralized here.
 * Access tokens: short-lived (15 min default), contains userId + role.
 * Refresh tokens: long-lived (7 days default), contains userId only.
 */

/**
 * Sign a new access token.
 * @param {{ _id: string, role: string }} payload
 * @returns {string}
 */
function signAccessToken(payload) {
  return jwt.sign(
    { sub: payload._id.toString(), role: payload.role },
    config.jwt.accessSecret,
    { expiresIn: config.jwt.accessExpiresIn }
  );
}

/**
 * Sign a new refresh token.
 * @param {{ _id: string }} payload
 * @returns {string}
 */
function signRefreshToken(payload) {
  return jwt.sign(
    { sub: payload._id.toString() },
    config.jwt.refreshSecret,
    { expiresIn: config.jwt.refreshExpiresIn }
  );
}

/**
 * Verify an access token. Throws JsonWebTokenError or TokenExpiredError on failure.
 * @param {string} token
 * @returns {{ sub: string, role: string }}
 */
function verifyAccessToken(token) {
  return jwt.verify(token, config.jwt.accessSecret);
}

/**
 * Verify a refresh token.
 * @param {string} token
 * @returns {{ sub: string }}
 */
function verifyRefreshToken(token) {
  return jwt.verify(token, config.jwt.refreshSecret);
}

module.exports = { signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken };
