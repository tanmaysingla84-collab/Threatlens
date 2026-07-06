'use strict';

const express = require('express');
const { body } = require('express-validator');
const fs = require('fs');
const crypto = require('crypto');


const upload = require('../middleware/upload');
const validate = require('../middleware/validate');
const asyncHandler = require('../utils/asyncHandler');
const aggregator = require('../services/integrations/aggregator.service');
const { ApiError } = require('../utils/errors');

const router = express.Router();

/**
 * Computes the SHA-256 hash of a file on disk
 * @param {string} filePath 
 * @returns {Promise<string>}
 */
function calculateFileSha256(filePath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);
    stream.on('data', (data) => hash.update(data));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', (err) => reject(err));
  });
}

// ─── Routes ───────────────────────────────────────────────────────────────────

/**
 * POST /api/analyze/file
 * Handles multipart file upload, hashes the file, deletes it, and runs aggregations.
 */
router.post(
  '/file',
  (req, res, next) => {
    upload.single('file')(req, res, (err) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(413).json({
            success: false,
            error: { message: `File too large. Maximum allowed size is ${Math.round(err.field || 32)}MB. Please upload a smaller file.` }
          });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return res.status(400).json({
            success: false,
            error: { message: 'Unexpected file field. Use field name "file".' }
          });
        }
        return next(err);
      }
      next();
    });
  },
  asyncHandler(async (req, res) => {
    if (!req.file) {
      throw new ApiError('No file uploaded. Please select a file and try again.', 400);
    }

    const filePath = req.file.path;
    let sha256 = '';

    try {
      // 1. Calculate SHA-256
      sha256 = await calculateFileSha256(filePath);

      // 2. Delete file immediately to prevent disk storage
      fs.unlink(filePath, (err) => {
        if (err) console.error(`[upload] Failed to delete temp file ${filePath}:`, err.message);
      });
    } catch (err) {
      // Ensure file cleanup if hashing fails
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      throw new ApiError(`Failed to process uploaded file: ${err.message}`, 500);
    }

    // 3. Query aggregator
    const results = await aggregator.aggregate('hash', sha256);

    // 4. Return unified report
    return res.json({
      success: true,
      data: {
        scanId: crypto.randomUUID(),
        type: 'file',
        input: req.file.originalname,
        sha256,
        originalFilename: req.file.originalname,
        fileMeta: {
          size: req.file.size,
          mimeType: req.file.mimetype
        },
        sources: results.sources,
        threatScore: results.threatScore,
        threatBand: results.threatBand,
        scoreBreakdown: results.scoreBreakdown,
        aiSummary: null,
        createdAt: new Date().toISOString()
      }
    });
  })
);

/**
 * POST /api/analyze/url
 * Body: { url }
 */
router.post(
  '/url',
  [
    body('url')
      .trim()
      .notEmpty()
      .withMessage('URL is required')
      .isURL()
      .withMessage('A valid URL is required')
  ],
  validate,
  asyncHandler(async (req, res) => {
    const { url } = req.body;
    const results = await aggregator.aggregate('url', url);

    return res.json({
      success: true,
      data: {
        scanId: crypto.randomUUID(),
        type: 'url',
        input: url,
        sources: results.sources,
        threatScore: results.threatScore,
        threatBand: results.threatBand,
        scoreBreakdown: results.scoreBreakdown,
        aiSummary: null, // Populated in Phase 5
        createdAt: new Date().toISOString()
      }
    });
  })
);

/**
 * POST /api/analyze/ip
 * Body: { ip }
 */
router.post(
  '/ip',
  [
    body('ip')
      .trim()
      .notEmpty()
      .withMessage('IP address is required')
      .isIP()
      .withMessage('A valid IP (v4 or v6) is required')
  ],
  validate,
  asyncHandler(async (req, res) => {
    const { ip } = req.body;
    const results = await aggregator.aggregate('ip', ip);

    return res.json({
      success: true,
      data: {
        scanId: crypto.randomUUID(),
        type: 'ip',
        input: ip,
        sources: results.sources,
        threatScore: results.threatScore,
        threatBand: results.threatBand,
        scoreBreakdown: results.scoreBreakdown,
        aiSummary: null, // Populated in Phase 5
        createdAt: new Date().toISOString()
      }
    });
  })
);

/**
 * POST /api/analyze/domain
 * Body: { domain }
 */
router.post(
  '/domain',
  [
    body('domain')
      .trim()
      .notEmpty()
      .withMessage('Domain is required')
      .matches(/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
      .withMessage('A valid domain name is required')
  ],
  validate,
  asyncHandler(async (req, res) => {
    const { domain } = req.body;
    const results = await aggregator.aggregate('domain', domain);

    return res.json({
      success: true,
      data: {
        scanId: crypto.randomUUID(),
        type: 'domain',
        input: domain,
        sources: results.sources,
        threatScore: results.threatScore,
        threatBand: results.threatBand,
        scoreBreakdown: results.scoreBreakdown,
        aiSummary: null, // Populated in Phase 5
        createdAt: new Date().toISOString()
      }
    });
  })
);

/**
 * POST /api/analyze/hash
 * Body: { hash }
 */
router.post(
  '/hash',
  [
    body('hash')
      .trim()
      .notEmpty()
      .withMessage('Hash value is required')
      .matches(/^[a-fA-F0-9]{32}$|^[a-fA-F0-9]{40}$|^[a-fA-F0-9]{64}$/)
      .withMessage('A valid MD5, SHA-1, or SHA-256 hash is required')
  ],
  validate,
  asyncHandler(async (req, res) => {
    const { hash } = req.body;
    const results = await aggregator.aggregate('hash', hash);

    return res.json({
      success: true,
      data: {
        scanId: crypto.randomUUID(),
        type: 'hash',
        input: hash,
        sha256: hash.length === 64 ? hash : null, // Store if it is sha256 already
        sources: results.sources,
        threatScore: results.threatScore,
        threatBand: results.threatBand,
        scoreBreakdown: results.scoreBreakdown,
        aiSummary: null, // Populated in Phase 5
        createdAt: new Date().toISOString()
      }
    });
  })
);

module.exports = router;
