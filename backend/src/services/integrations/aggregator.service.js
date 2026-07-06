'use strict';

const virustotal = require('./virustotal.service');
const malwarebazaar = require('./malwarebazaar.service');
const hybridanalysis = require('./hybridanalysis.service');
const urlscan = require('./urlscan.service');
const threatminer = require('./threatminer.service');
const abuseipdb = require('./abuseipdb.service');
const { calculateThreatScore } = require('../scoring.service');

/**
 * Aggregator Service
 * Resolves which external services to query based on indicator type,
 * runs them in parallel, aggregates results, and runs the threat scoring engine.
 */
async function aggregate(indicatorType, value) {
  const jobs = [];

  // Determine integrations to run based on indicator type
  if (indicatorType === 'hash' || indicatorType === 'file') {
    jobs.push({ name: 'virustotal', run: () => virustotal.query(indicatorType, value) });
    jobs.push({ name: 'malwarebazaar', run: () => malwarebazaar.query(indicatorType, value) });
    jobs.push({ name: 'hybridanalysis', run: () => hybridanalysis.query(indicatorType, value) });
    jobs.push({ name: 'threatminer', run: () => threatminer.query(indicatorType, value) });
  } else if (indicatorType === 'url') {
    jobs.push({ name: 'virustotal', run: () => virustotal.query(indicatorType, value) });
    jobs.push({ name: 'urlscan', run: () => urlscan.query(indicatorType, value) });
  } else if (indicatorType === 'ip') {
    jobs.push({ name: 'virustotal', run: () => virustotal.query(indicatorType, value) });
    jobs.push({ name: 'abuseipdb', run: () => abuseipdb.query(indicatorType, value) });
    jobs.push({ name: 'threatminer', run: () => threatminer.query(indicatorType, value) });
  } else if (indicatorType === 'domain') {
    jobs.push({ name: 'virustotal', run: () => virustotal.query(indicatorType, value) });
    jobs.push({ name: 'threatminer', run: () => threatminer.query(indicatorType, value) });
  } else {
    throw new Error(`Unsupported indicator type for aggregation: ${indicatorType}`);
  }

  // Execute in parallel
  const results = await Promise.allSettled(jobs.map((job) => job.run()));

  const sources = results.map((result, idx) => {
    const jobName = jobs[idx].name;
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      return {
        source: jobName,
        success: false,
        raw: null,
        normalized: null,
        error: result.reason?.message || 'Execution failed',
        fetchedAt: new Date()
      };
    }
  });

  // Extract signals for scoring engine
  const vtResult = sources.find((s) => s.source === 'virustotal');
  const haResult = sources.find((s) => s.source === 'hybridanalysis');
  const mbResult = sources.find((s) => s.source === 'malwarebazaar');
  const abuseResult = sources.find((s) => s.source === 'abuseipdb');

  const signals = {
    vtDetections: Boolean(
      vtResult?.success && 
      vtResult.normalized && 
      (vtResult.normalized.malicious > 0 || vtResult.normalized.suspicious > 0)
    ),
    haMalicious: Boolean(
      haResult?.success && 
      haResult.normalized && 
      haResult.normalized.match &&
      (haResult.normalized.verdict === 'malicious' || haResult.normalized.verdict === 'critical')
    ),
    mbMatch: Boolean(
      mbResult?.success && 
      mbResult.normalized && 
      mbResult.normalized.match
    ),
    abuseScoreHigh: Boolean(
      abuseResult?.success && 
      abuseResult.normalized && 
      abuseResult.normalized.abuseConfidenceScore >= 75
    )
  };

  // Run the pure scoring function
  const scoring = calculateThreatScore(signals);

  return {
    sources,
    threatScore: scoring.score,
    threatBand: scoring.band,
    scoreBreakdown: scoring.breakdown
  };
}

module.exports = { aggregate };
