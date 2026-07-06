'use strict';

const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const config = require('../config/env');
const { ApiError } = require('../utils/errors');

const MAX_FILE_SIZE = config.upload.maxFileSizeMb * 1024 * 1024;

// Allowed MIME types for upload — we hash them for reputation lookup, not execute them
const ALLOWED_MIME_TYPES = new Set([
  'application/octet-stream',
  'application/x-msdownload',
  'application/x-executable',
  'application/x-dosexec',
  'application/pdf',
  'application/zip',
  'application/x-zip-compressed',
  'application/x-rar-compressed',
  'application/x-7z-compressed',
  'application/vnd.microsoft.portable-executable',
  'application/x-msi',
  'application/x-ms-dos-executable',
  'text/plain',
  'application/javascript',
  'application/json',
  'application/xml',
  'text/html',
  'image/png',
  'image/jpeg',
  'image/gif',
]);

/**
 * Disk storage: temp files go to the uploads directory with a random hex name.
 * Files are DELETED after SHA256 is computed in the analysis controller.
 * The uploads/ directory must be outside the web-root (it is — served nowhere).
 */
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, config.upload.dir);
  },
  filename(req, file, cb) {
    // Random name prevents path traversal / collision
    const randomName = crypto.randomBytes(16).toString('hex');
    const ext = path.extname(file.originalname).slice(0, 10); // cap extension length
    cb(null, `${randomName}${ext}`);
  },
});

function fileFilter(req, file, cb) {
  if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError(`File type '${file.mimetype}' is not allowed`, 415), false);
  }
}

const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1, // single file only
  },
  fileFilter,
});

module.exports = uploadMiddleware;
