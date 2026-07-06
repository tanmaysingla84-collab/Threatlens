'use strict';

// Resolve environment variables first
require('../config/env');

const virustotal = require('../services/integrations/virustotal.service');
const malwarebazaar = require('../services/integrations/malwarebazaar.service');
const hybridanalysis = require('../services/integrations/hybridanalysis.service');
const urlscan = require('../services/integrations/urlscan.service');
const threatminer = require('../services/integrations/threatminer.service');
const abuseipdb = require('../services/integrations/abuseipdb.service');
const aggregator = require('../services/integrations/aggregator.service');

const TEST_IP = '8.8.8.8';
const TEST_DOMAIN = 'google.com';
const TEST_HASH = '275a021bbfb6489e54d471899f7db9d16bba4e02f8bb1a8031e2f9a7f2f2f17c'; // EICAR test file hash
const TEST_URL = 'https://example.com';

async function runDiagnostics() {
  console.log('==================================================');
  console.log('       ThreatLens CTI Platform Diagnostics        ');
  console.log('==================================================\n');

  console.log('--- 1. Testing Individual Integrations ---');

  // VirusTotal
  console.log('\n[VirusTotal] Querying IP: %s...', TEST_IP);
  const vtRes = await virustotal.query('ip', TEST_IP);
  printResult('VirusTotal (IP)', vtRes);

  // MalwareBazaar
  console.log('\n[MalwareBazaar] Querying Hash: %s...', TEST_HASH);
  const mbRes = await malwarebazaar.query('hash', TEST_HASH);
  printResult('MalwareBazaar (Hash)', mbRes);

  // Hybrid Analysis
  console.log('\n[Hybrid Analysis] Querying Hash: %s...', TEST_HASH);
  const haRes = await hybridanalysis.query('hash', TEST_HASH);
  printResult('Hybrid Analysis (Hash)', haRes);

  // ThreatMiner
  console.log('\n[ThreatMiner] Querying Domain: %s...', TEST_DOMAIN);
  const tmRes = await threatminer.query('domain', TEST_DOMAIN);
  printResult('ThreatMiner (Domain)', tmRes);

  // AbuseIPDB
  console.log('\n[AbuseIPDB] Querying IP: %s...', TEST_IP);
  const abuseRes = await abuseipdb.query('ip', TEST_IP);
  printResult('AbuseIPDB (IP)', abuseRes);

  // URLScan (optional/conditional lookup since it can take time)
  console.log('\n[URLScan] Querying URL: %s (Checking search cache)...', TEST_URL);
  const urlScanRes = await urlscan.query('url', TEST_URL);
  printResult('URLScan (URL)', urlScanRes);

  console.log('\n--- 2. Testing Aggregator and Scoring ---');
  console.log('\n[Aggregator] Aggregating IP: %s...', TEST_IP);
  try {
    const aggRes = await aggregator.aggregate('ip', TEST_IP);
    console.log('Aggregator Status: SUCCESS');
    console.log('Computed Threat Score: %d (%s)', aggRes.threatScore, aggRes.threatBand);
    console.log('Score Breakdown:', JSON.stringify(aggRes.scoreBreakdown, null, 2));
    console.log('Integrated Sources Status:');
    aggRes.sources.forEach((s) => {
      console.log(` - ${s.source}: ${s.success ? 'SUCCESS' : 'FAILED (' + s.error + ')'}`);
    });
  } catch (err) {
    console.error('Aggregator execution failed:', err.message);
  }

  console.log('\n==================================================');
  console.log('             Diagnostics Complete                 ');
  console.log('==================================================');
}

function printResult(name, res) {
  if (res.success) {
    console.log(`Status: SUCCESS`);
    console.log(`Normalized:`, JSON.stringify(res.normalized, null, 2));
  } else {
    console.log(`Status: DEGRADED / ERROR`);
    console.log(`Error Message: ${res.error}`);
  }
}

runDiagnostics().catch((err) => {
  console.error('Fatal diagnostics error:', err);
});
