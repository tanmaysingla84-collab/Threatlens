'use strict';

const axios = require('axios');
const config = require('../../config/env');

/**
 * Hybrid Analysis API Integration Service
 * Query type support: hash, file
 */
async function query(indicatorType, value) {
  if (indicatorType !== 'hash' && indicatorType !== 'file') {
    return {
      source: 'hybridanalysis',
      success: false,
      raw: null,
      normalized: null,
      error: `Hybrid Analysis only supports hash lookups, received: ${indicatorType}`,
      fetchedAt: new Date()
    };
  }

  const apiKey = config.apis.hybridAnalysis;
  if (!apiKey) {
    return {
      source: 'hybridanalysis',
      success: false,
      raw: null,
      normalized: null,
      error: 'API key not configured',
      fetchedAt: new Date()
    };
  }

  const endpoint = `https://www.hybrid-analysis.com/api/v2/overview/${encodeURIComponent(value)}`;

  try {
    const response = await axios.get(endpoint, {
      headers: {
        'api-key': apiKey,
        'user-agent': 'Falcon Sandbox',
        'Accept': 'application/json'
      },
      timeout: 10000 // 10s
    });

    const data = response.data;

    // Hybrid Analysis returns either an overview object directly or an array of objects.
    // If it's an array, take the first report.
    const report = Array.isArray(data) ? data[0] : data;

    if (!report) {
      return {
        source: 'hybridanalysis',
        success: true,
        raw: data,
        normalized: {
          match: false,
          verdict: 'unknown',
          threatScore: 0,
          behaviorTags: [],
          permalink: null
        },
        error: null,
        fetchedAt: new Date()
      };
    }

    const normalized = {
      match: true,
      verdict: report.verdict || 'unknown',
      threatScore: report.threat_score || 0,
      behaviorTags: report.classification_tags || [],
      family: report.vx_family || null,
      permalink: `https://www.hybrid-analysis.com/sample/${value}`
    };

    return {
      source: 'hybridanalysis',
      success: true,
      raw: data,
      normalized,
      error: null,
      fetchedAt: new Date()
    };
  } catch (error) {
    const status = error.response?.status;
    const errMsg = error.response?.data?.message || error.message;

    // Handle 404 (hash not found in HA database)
    if (status === 404) {
      return {
        source: 'hybridanalysis',
        success: true,
        raw: error.response?.data || null,
        normalized: {
          match: false,
          verdict: 'unknown',
          threatScore: 0,
          behaviorTags: [],
          permalink: null
        },
        error: null,
        fetchedAt: new Date()
      };
    }

    return {
      source: 'hybridanalysis',
      success: false,
      raw: error.response?.data || null,
      normalized: null,
      error: errMsg,
      fetchedAt: new Date()
    };
  }
}

module.exports = { query };
