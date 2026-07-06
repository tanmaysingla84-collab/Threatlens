'use strict';

const axios = require('axios');
const config = require('../../config/env');

/**
 * AbuseIPDB API Integration Service
 * Query type support: ip
 */
async function query(indicatorType, value) {
  if (indicatorType !== 'ip') {
    return {
      source: 'abuseipdb',
      success: false,
      raw: null,
      normalized: null,
      error: `AbuseIPDB only supports IP lookups, received: ${indicatorType}`,
      fetchedAt: new Date()
    };
  }

  const apiKey = config.apis.abuseIpdb;
  if (!apiKey) {
    return {
      source: 'abuseipdb',
      success: false,
      raw: null,
      normalized: null,
      error: 'API key not configured',
      fetchedAt: new Date()
    };
  }

  try {
    const response = await axios.get('https://api.abuseipdb.com/api/v2/check', {
      params: {
        ipAddress: value,
        maxAgeInDays: 90,
        verbose: true
      },
      headers: {
        'Key': apiKey,
        'Accept': 'application/json'
      },
      timeout: 8000 // 8s
    });

    const data = response.data?.data;
    if (!data) {
      throw new Error('Invalid response structure from AbuseIPDB');
    }

    const score = data.abuseConfidenceScore || 0;

    const normalized = {
      ipAddress: data.ipAddress,
      abuseConfidenceScore: score,
      totalReports: data.totalReports || 0,
      countryCode: data.countryCode || '',
      isp: data.isp || '',
      domain: data.domain || '',
      isWhitelisted: data.isWhitelisted || false,
      verdict: score >= 75 ? 'malicious' : (score > 0 ? 'suspicious' : 'clean')
    };

    return {
      source: 'abuseipdb',
      success: true,
      raw: response.data,
      normalized,
      error: null,
      fetchedAt: new Date()
    };
  } catch (error) {
    const errMsg = error.response?.data?.errors?.[0]?.detail || error.message;
    return {
      source: 'abuseipdb',
      success: false,
      raw: error.response?.data || null,
      normalized: null,
      error: errMsg,
      fetchedAt: new Date()
    };
  }
}

module.exports = { query };
