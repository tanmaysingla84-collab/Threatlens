'use strict';

const axios = require('axios');
const config = require('../../config/env');

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * VirusTotal API Integration Service
 * Query type support: hash, url, ip, domain
 */
async function query(indicatorType, value) {
  const apiKey = config.apis.virusTotal;
  if (!apiKey) {
    return {
      source: 'virustotal',
      success: false,
      raw: null,
      normalized: null,
      error: 'API key not configured',
      fetchedAt: new Date()
    };
  }

  const headers = { 'x-apikey': apiKey, 'Accept': 'application/json' };

  let endpoint = '';
  if (indicatorType === 'hash' || indicatorType === 'file') {
    endpoint = `https://www.virustotal.com/api/v3/files/${value}`;
  } else if (indicatorType === 'url') {
    const urlId = Buffer.from(value).toString('base64url');
    endpoint = `https://www.virustotal.com/api/v3/urls/${urlId}`;
  } else if (indicatorType === 'ip') {
    endpoint = `https://www.virustotal.com/api/v3/ip_addresses/${value}`;
  } else if (indicatorType === 'domain') {
    endpoint = `https://www.virustotal.com/api/v3/domains/${value}`;
  } else {
    return {
      source: 'virustotal',
      success: false,
      raw: null,
      normalized: null,
      error: `Unsupported indicator type: ${indicatorType}`,
      fetchedAt: new Date()
    };
  }

  try {
    const response = await axios.get(endpoint, { headers, timeout: 12000 });

    const attributes = response.data?.data?.attributes;
    if (!attributes) {
      throw new Error('Invalid response structure from VirusTotal');
    }

    const stats = attributes.last_analysis_stats || {};
    const maliciousCount = stats.malicious || 0;
    const suspiciousCount = stats.suspicious || 0;
    const harmlessCount = stats.harmless || 0;
    const undetectedCount = stats.undetected || 0;
    const totalEngines = maliciousCount + suspiciousCount + harmlessCount + undetectedCount;

    const vtId = response.data?.data?.id || encodeURIComponent(value);
    let guiPath = 'search';
    if (indicatorType === 'hash' || indicatorType === 'file') guiPath = 'file';
    else if (indicatorType === 'url') guiPath = 'url';
    else if (indicatorType === 'ip') guiPath = 'ip-address';
    else if (indicatorType === 'domain') guiPath = 'domain';

    const normalized = {
      malicious: maliciousCount,
      suspicious: suspiciousCount,
      harmless: harmlessCount,
      undetected: undetectedCount,
      totalEngines,
      reputation: attributes.reputation,
      permalink: `https://www.virustotal.com/gui/${guiPath}/${vtId}`,
      verdict: maliciousCount > 0 ? 'malicious' : suspiciousCount > 0 ? 'suspicious' : 'clean'
    };

    return {
      source: 'virustotal',
      success: true,
      raw: response.data,
      normalized,
      error: null,
      fetchedAt: new Date()
    };
  } catch (error) {
    const status = error.response?.status;
    const errMsg = error.response?.data?.error?.message || error.message;

    // For URLs not yet in VT database — submit then poll for results
    if (status === 404 && indicatorType === 'url') {
      try {
        // Step 1: Submit URL for scanning
        const submitResponse = await axios.post(
          'https://www.virustotal.com/api/v3/urls',
          new URLSearchParams({ url: value }),
          {
            headers: { ...headers, 'Content-Type': 'application/x-www-form-urlencoded' },
            timeout: 12000
          }
        );

        const analysisId = submitResponse.data?.data?.id;
        
        if (!analysisId) {
          throw new Error('No analysis ID returned from VT submission');
        }

        // The analysisId format is "u-<sha256>-<timestamp>"
        // Using the exact SHA256 for the GUI link avoids base64 encoding errors on VT's site
        const sha256 = analysisId.split('-')[1] || Buffer.from(value).toString('base64url').replace(/=/g, '');
        const permalink = `https://www.virustotal.com/gui/url/${sha256}/detection`;

        // Step 2: Poll analysis results (max 6 retries × 5s = 30s)
        let retries = 6;
        while (retries > 0) {
          await delay(5000);
          try {
            const analysisResp = await axios.get(
              `https://www.virustotal.com/api/v3/analyses/${analysisId}`,
              { headers, timeout: 12000 }
            );
            const analysisAttrs = analysisResp.data?.data?.attributes;
            const analysisStatus = analysisAttrs?.status;

            if (analysisStatus === 'completed') {
              const stats = analysisAttrs?.stats || {};
              const maliciousCount = stats.malicious || 0;
              const suspiciousCount = stats.suspicious || 0;
              const harmlessCount = stats.harmless || 0;
              const undetectedCount = stats.undetected || 0;
              const totalEngines = maliciousCount + suspiciousCount + harmlessCount + undetectedCount;

              return {
                source: 'virustotal',
                success: true,
                raw: analysisResp.data,
                normalized: {
                  malicious: maliciousCount,
                  suspicious: suspiciousCount,
                  harmless: harmlessCount,
                  undetected: undetectedCount,
                  totalEngines,
                  reputation: null,
                  permalink,
                  verdict: maliciousCount > 0 ? 'malicious' : suspiciousCount > 0 ? 'suspicious' : 'clean'
                },
                error: null,
                fetchedAt: new Date()
              };
            }
            // still queued/in-progress, keep polling
          } catch (pollErr) {
            // ignore poll errors, just retry
          }
          retries--;
        }

        // Timed out waiting for analysis — return submitted state with note
        return {
          source: 'virustotal',
          success: true,
          raw: submitResponse.data,
          normalized: {
            malicious: 0,
            suspicious: 0,
            harmless: 0,
            undetected: 0,
            totalEngines: 0,
            reputation: null,
            permalink,
            verdict: 'pending',
            note: 'URL submitted to VirusTotal for analysis. Results not yet ready — check the VT report link for updates.'
          },
          error: null,
          fetchedAt: new Date()
        };
      } catch (submitErr) {
        return {
          source: 'virustotal',
          success: false,
          raw: submitErr.response?.data || null,
          normalized: null,
          error: `URL not in VirusTotal; submission failed: ${submitErr.message}`,
          fetchedAt: new Date()
        };
      }
    }

    return {
      source: 'virustotal',
      success: false,
      raw: error.response?.data || null,
      normalized: null,
      error: status === 404 ? 'Indicator not found in VirusTotal' : errMsg,
      fetchedAt: new Date()
    };
  }
}

module.exports = { query };
