'use strict';

const mongoose = require('mongoose');

/**
 * Tracks the health/availability of each external threat-intel API source.
 * Updated periodically by the admin health-check cron (Phase 8).
 */
const apiHealthSchema = new mongoose.Schema(
  {
    source: {
      type: String,
      required: true,
      unique: true,
      enum: ['virustotal', 'malwarebazaar', 'hybridanalysis', 'urlscan', 'threatminer', 'abuseipdb'],
    },

    status: {
      type: String,
      enum: ['up', 'down', 'degraded', 'unchecked'],
      default: 'unchecked',
    },

    lastCheckedAt: {
      type: Date,
      default: null,
    },

    // HTTP status code or error message from last check
    lastError: {
      type: String,
      default: null,
    },

    // Response time in ms from last successful check
    responseTimeMs: {
      type: Number,
      default: null,
    },

    // Whether an API key is configured for this source
    keyConfigured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const ApiHealth = mongoose.model('ApiHealth', apiHealthSchema);

module.exports = ApiHealth;
