'use strict';

const axios = require('axios');
const config = require('../../config/env');

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * URLScan.io API Integration Service
 * Uses API key for scan submission only.
 * Does NOT search existing scans (avoids hitting private scan UUIDs that return 403).
 * Always submits a fresh public scan and polls for the result.
 */
async function query(indicatorType, value) {
  if (indicatorType !== 'url') {
    return {
      source: 'urlscan',
      success: false,
      raw: null,
      normalized: null,
      error: `URLScan only supports URL lookups, received: ${indicatorType}`,
      fetchedAt: new Date()
    };
  }

  const apiKey = config.apis.urlScan;
  if (!apiKey) {
    return {
      source: 'urlscan',
      success: false,
      raw: null,
      normalized: null,
      error: 'URLScan API key not configured (URLSCAN_API_KEY missing in .env)',
      fetchedAt: new Date()
    };
  }

  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'API-Key': apiKey
  };

  // Use API key for both submission and fetching — our submitted scans are
  // private to this key, so we must authenticate to read the results
  const fetchHeaders = { 'Accept': 'application/json', 'API-Key': apiKey };

  let uuid = null;

  try {
    // ── Step 1: Submit a fresh public scan ────────────────────────────────────
    console.log(`[urlscan] Submitting scan for: ${value}`);
    try {
      const submitResp = await axios.post(
        'https://urlscan.io/api/v1/scan/',
        { url: value, visibility: 'public' },
        { headers, timeout: 12000 }
      );
      uuid = submitResp.data?.uuid;
      console.log(`[urlscan] Scan submitted, UUID: ${uuid}`);
    } catch (submitErr) {
      const status = submitErr.response?.status;
      const msg = submitErr.response?.data?.message
        || submitErr.response?.data?.errors?.[0]?.detail
        || submitErr.message;

      if (status === 429) {
        return {
          source: 'urlscan',
          success: false,
          raw: null,
          normalized: null,
          error: 'URLScan rate limit reached. Please wait before scanning another URL.',
          fetchedAt: new Date()
        };
      }

      return {
        source: 'urlscan',
        success: false,
        raw: null,
        normalized: null,
        error: `URLScan submission failed (${status || 'network error'}): ${msg}`,
        fetchedAt: new Date()
      };
    }

    if (!uuid) {
      return {
        source: 'urlscan',
        success: false,
        raw: null,
        normalized: null,
        error: 'URLScan did not return a scan UUID',
        fetchedAt: new Date()
      };
    }

    // ── Step 2: Wait for scan to start, then poll for result ─────────────────
    await delay(8000); // initial 8s wait for URLScan to crawl the page

    const resultUrl = `https://urlscan.io/api/v1/result/${uuid}/`;
    let retries = 6; // 6 × 6s = up to 36s additional wait
    let resultData = null;

    while (retries > 0) {
      try {
        const getResp = await axios.get(resultUrl, { headers: fetchHeaders, timeout: 15000 });
        if (getResp.status === 200) {
          resultData = getResp.data;
          console.log(`[urlscan] Got result for UUID: ${uuid}`);
          break;
        }
      } catch (pollErr) {
        const pollStatus = pollErr.response?.status;
        if (pollStatus === 404) {
          // Still processing — wait and retry
          retries--;
          if (retries > 0) await delay(6000);
        } else if (pollStatus === 429) {
          const retryAfter = parseInt(pollErr.response.headers['retry-after'] || '30', 10);
          await delay(retryAfter * 1000);
        } else {
          console.error(`[urlscan] Poll error ${pollStatus}: ${pollErr.message}`);
          retries--;
          if (retries > 0) await delay(6000);
        }
      }
    }

    // ── Step 3: Return pending if scan still processing ───────────────────────
    if (!resultData) {
      const permalink = `https://urlscan.io/result/${uuid}/`;
      return {
        source: 'urlscan',
        success: true,
        raw: { uuid },
        normalized: {
          uuid,
          screenshot: null,
          malicious: false,
          score: 0,
          domain: '',
          ip: '',
          server: '',
          country: '',
          redirects: [],
          permalink,
          verdict: 'pending',
          note: `Scan submitted and still processing. View at: ${permalink}`
        },
        error: null,
        fetchedAt: new Date()
      };
    }

    // ── Step 4: Normalize the completed result ────────────────────────────────
    const page = resultData.page || {};
    const verdicts = resultData.verdicts?.overall || {};
    const screenshot = `https://urlscan.io/screenshots/${uuid}.png`;

    return {
      source: 'urlscan',
      success: true,
      raw: resultData,
      normalized: {
        uuid,
        screenshot,
        malicious: verdicts.malicious || false,
        score: verdicts.score || 0,
        domain: page.domain || '',
        ip: page.ip || '',
        server: page.server || '',
        country: page.country || '',
        redirects: resultData.lists?.urls || [],
        permalink: `https://urlscan.io/result/${uuid}/`,
        verdict: verdicts.malicious ? 'malicious' : (verdicts.score > 0 ? 'suspicious' : 'clean')
      },
      error: null,
      fetchedAt: new Date()
    };

  } catch (error) {
    const responseData = error.response?.data;
    const errMsg = responseData?.message
      || responseData?.errors?.[0]?.detail
      || error.message;

    console.error(`[urlscan] Unhandled error: ${error.response?.status} — ${errMsg}`);
    return {
      source: 'urlscan',
      success: false,
      raw: responseData || null,
      normalized: null,
      error: errMsg,
      fetchedAt: new Date()
    };
  }
}

module.exports = { query };
