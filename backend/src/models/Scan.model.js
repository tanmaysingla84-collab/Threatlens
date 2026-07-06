'use strict';

const mongoose = require('mongoose');

/**
 * Per-source result shape stored inside Scan.sources[].
 * `raw` holds the unmodified API response; `normalized` holds our standardized fields.
 */
const sourceResultSchema = new mongoose.Schema(
  {
    source:     { type: String, required: true },   // 'virustotal' | 'malwarebazaar' | etc.
    success:    { type: Boolean, required: true },
    raw:        { type: mongoose.Schema.Types.Mixed, default: null },
    normalized: { type: mongoose.Schema.Types.Mixed, default: null },
    error:      { type: String, default: null },
    fetchedAt:  { type: Date, default: Date.now },
  },
  { _id: false }
);

const scanSchema = new mongoose.Schema(
  {
    // Owner
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // Scan type and input
    type: {
      type: String,
      enum: ['file', 'url', 'ip', 'domain', 'hash'],
      required: true,
    },

    // Human-readable label of what was scanned (filename, url, ip, domain, or hash string)
    input: {
      type: String,
      required: true,
      maxlength: 2048,
    },

    // SHA-256 — only populated for file and hash scan types
    sha256: {
      type: String,
      default: null,
      index: true, // fast dedup lookup
      sparse: true,
    },

    // Per-source API results
    sources: [sourceResultSchema],

    // Computed threat score (0–100) and band
    threatScore: { type: Number, default: 0 },
    threatBand:  { type: String, enum: ['Safe', 'Low', 'Medium', 'High'], default: 'Safe' },

    // Score breakdown for transparency
    scoreBreakdown: { type: mongoose.Schema.Types.Mixed, default: null },

    // AI-generated summary text
    aiSummary: { type: String, default: null },

    // Original filename (for file uploads)
    originalFilename: { type: String, default: null },

    // File metadata (size, mime type) — only for file scans
    fileMeta: {
      size:     { type: Number, default: null },
      mimeType: { type: String, default: null },
    },
  },
  {
    timestamps: true, // adds createdAt, updatedAt
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
scanSchema.index({ userId: 1, createdAt: -1 }); // user history (most recent first)
scanSchema.index({ createdAt: -1 });              // admin timeline

const Scan = mongoose.model('Scan', scanSchema);

module.exports = Scan;
