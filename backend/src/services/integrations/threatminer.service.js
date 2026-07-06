'use strict';

const axios = require('axios');

/**
 * AlienVault OTX (Open Threat Exchange) Integration — replaces ThreatMiner.
 * Completely free and public API — no API key required for indicator lookups.
 * Supports: IP, Domain, Hash (MD5/SHA1/SHA256), URL
 */
async function query(indicatorType, value) {
  const supportedTypes = ['ip', 'domain', 'hash', 'file', 'url'];
  if (!supportedTypes.includes(indicatorType)) {
    return {
      source: 'threatminer',
      success: false,
      raw: null,
      normalized: null,
      error: `Indicator type not supported: ${indicatorType}`,
      fetchedAt: new Date()
    };
  }

  const headers = {
    'Accept': 'application/json',
    'User-Agent': 'ThreatLens-CTI/1.0'
  };

  try {
    let endpoint = '';
    let sections = [];

    if (indicatorType === 'ip') {
      endpoint = `https://otx.alienvault.com/api/v1/indicators/IPv4/${encodeURIComponent(value)}`;
      sections = ['general', 'geo', 'malware', 'reputation'];
    } else if (indicatorType === 'domain') {
      endpoint = `https://otx.alienvault.com/api/v1/indicators/domain/${encodeURIComponent(value)}`;
      sections = ['general', 'geo', 'malware', 'whois'];
    } else if (indicatorType === 'url') {
      endpoint = `https://otx.alienvault.com/api/v1/indicators/url/${encodeURIComponent(value)}`;
      sections = ['general'];
    } else {
      // hash or file — try SHA256 first, fall back to 'file' hash lookup
      endpoint = `https://otx.alienvault.com/api/v1/indicators/file/${encodeURIComponent(value)}`;
      sections = ['general', 'analysis'];
    }

    // Fetch all sections in parallel
    const results = await Promise.allSettled(
      sections.map(section =>
        axios.get(`${endpoint}/${section}`, { headers, timeout: 20000 })
      )
    );

    const raw = {};
    sections.forEach((section, i) => {
      if (results[i].status === 'fulfilled') {
        raw[section] = results[i].value.data;
      }
    });

    const general = raw.general || {};
    const pulseCount = general.pulse_info?.count || 0;
    const pulses = general.pulse_info?.pulses || [];
    const isMalicious = pulseCount > 0;

    // Normalize per type
    let normalized = {};

    if (indicatorType === 'ip') {
      const geo = raw.geo || {};
      normalized = {
        pulseCount,
        isMalicious,
        threatNames: pulses.slice(0, 5).map(p => p.name),
        country: geo.country_name || general.country_name || '',
        city: geo.city || '',
        asn: geo.asn || general.asn || '',
        reputation: raw.reputation?.reputation?.value ?? null,
        malwareFamilies: (raw.malware?.data || []).slice(0, 5).map(m => m.name || m.hash)
      };
    } else if (indicatorType === 'domain') {
      normalized = {
        pulseCount,
        isMalicious,
        threatNames: pulses.slice(0, 5).map(p => p.name),
        whois: general.whois || '',
        malwareFamilies: (raw.malware?.data || []).slice(0, 5).map(m => m.name || m.hash)
      };
    } else if (indicatorType === 'hash' || indicatorType === 'file') {
      const analysis = raw.analysis || {};
      normalized = {
        pulseCount,
        isMalicious,
        threatNames: pulses.slice(0, 5).map(p => p.name),
        malwareFamily: analysis.analysis?.info?.results?.imphash || '',
        fileType: analysis.analysis?.info?.results?.file_type || '',
        verdict: isMalicious ? 'malicious' : 'unknown'
      };
    } else if (indicatorType === 'url') {
      normalized = {
        pulseCount,
        isMalicious,
        threatNames: pulses.slice(0, 5).map(p => p.name)
      };
    }

    return {
      source: 'threatminer',  // keep same key so frontend doesn't need changes
      success: true,
      raw,
      normalized,
      error: null,
      fetchedAt: new Date()
    };

  } catch (error) {
    const status = error.response?.status;
    const msg = status === 404
      ? 'Indicator not found in OTX database'
      : error.message;

    return {
      source: 'threatminer',
      success: status === 404,   // 404 = "not found" is still a valid response
      raw: null,
      normalized: status === 404 ? { pulseCount: 0, isMalicious: false, threatNames: [] } : null,
      error: status === 404 ? null : msg,
      fetchedAt: new Date()
    };
  }
}

module.exports = { query };
