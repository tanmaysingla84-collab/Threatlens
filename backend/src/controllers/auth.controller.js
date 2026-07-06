'use strict';

const crypto = require('crypto');
const User = require('../models/User.model');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const { sendSuccess } = require('../utils/response');
const { ApiError, UnauthorizedError, NotFoundError, ValidationError } = require('../utils/errors');

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Issue both tokens and return the public user + tokens payload.
 * Centralising here avoids repetition between register and login.
 */
function issueTokens(user) {
  const accessToken  = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  return { user: user.toPublicJSON(), accessToken, refreshToken };
}

// ─── Controllers ──────────────────────────────────────────────────────────────

/**
 * POST /api/auth/register
 * Body: { name, email, password }
 */
async function register(req, res) {
  const { name, email, password } = req.body;

  // Check duplicate email (Mongoose unique index also catches this, but gives a cleaner message here)
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    throw new ValidationError('An account with this email already exists');
  }

  const passwordHash = await User.hashPassword(password);
  const user = await User.create({ name, email, passwordHash });

  const payload = issueTokens(user);
  return sendSuccess(res, payload, 201);
}

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
async function login(req, res) {
  const { email, password } = req.body;

  // Explicitly select passwordHash (it's excluded by default via schema `select: false`)
  const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');

  if (!user || !user.isActive) {
    // Constant-time-ish: always run compare even when user doesn't exist to avoid timing attacks
    await User.hashPassword('dummy_to_prevent_timing');
    throw new UnauthorizedError('Invalid email or password');
  }

  const passwordMatch = await user.comparePassword(password);
  if (!passwordMatch) {
    throw new UnauthorizedError('Invalid email or password');
  }

  // Update last-login timestamp (fire and forget — don't block the response)
  user.lastLogin = new Date();
  user.save().catch(() => {}); // non-blocking

  const payload = issueTokens(user);
  return sendSuccess(res, payload);
}

/**
 * POST /api/auth/refresh
 * Body: { refreshToken }
 */
async function refresh(req, res) {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new UnauthorizedError('Refresh token is required');
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch {
    throw new UnauthorizedError('Invalid or expired refresh token');
  }

  const user = await User.findById(decoded.sub);
  if (!user || !user.isActive) {
    throw new UnauthorizedError('User not found or account deactivated');
  }

  const accessToken = signAccessToken(user);
  return sendSuccess(res, { accessToken });
}

/**
 * GET /api/auth/me
 * Protected — returns current user from req.user (set by requireAuth middleware)
 */
async function me(req, res) {
  return sendSuccess(res, req.user.toPublicJSON());
}

/**
 * POST /api/auth/forgot-password
 * Body: { email }
 * Generates a reset token and (in production) emails it.
 * For now: returns the token in the response in dev mode so the flow can be tested.
 */
async function forgotPassword(req, res) {
  const { email } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() });

  // Always respond with 200 to prevent email enumeration attacks
  if (!user) {
    return sendSuccess(res, { message: 'If that email exists, a reset link has been sent.' });
  }

  // Generate a secure random token, store a SHA-256 hash of it
  const rawToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  await user.save();

  // TODO Phase 9: send email with reset link containing rawToken
  // The raw token goes in the email URL, never stored — only the hash is in DB.
  const resetUrl = `http://localhost:5173/reset-password?token=${rawToken}&email=${encodeURIComponent(email)}`;
  console.log(`[auth] Password reset link (dev only): ${resetUrl}`);

  const responseData = { message: 'If that email exists, a reset link has been sent.' };
  // Expose reset URL in dev for testing (NEVER in production)
  if (process.env.NODE_ENV === 'development') {
    responseData.devResetUrl = resetUrl;
  }

  return sendSuccess(res, responseData);
}

/**
 * POST /api/auth/reset-password
 * Body: { token, email, password }
 */
async function resetPassword(req, res) {
  const { token, email, password } = req.body;

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    email: email.toLowerCase(),
    resetPasswordToken: hashedToken,
    resetPasswordExpiry: { $gt: new Date() }, // token not expired
  }).select('+resetPasswordToken +resetPasswordExpiry');

  if (!user) {
    throw new ApiError('Password reset token is invalid or has expired', 400);
  }

  user.passwordHash = await User.hashPassword(password);
  user.resetPasswordToken  = null;
  user.resetPasswordExpiry = null;
  await user.save();

  return sendSuccess(res, { message: 'Password reset successfully. You can now log in.' });
}

module.exports = { register, login, refresh, me, forgotPassword, resetPassword };
