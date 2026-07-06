'use strict';

/**
 * Pure function to calculate threat score based on integration signals.
 * 
 * Score rules:
 * - VirusTotal detections present -> +40
 * - Hybrid Analysis verdict = malicious -> +30
 * - MalwareBazaar match found -> +20
 * - AbuseIPDB confidence score high (>= 75) -> +10
 * 
 * Clamps total to 0-100 and maps to Safe, Low, Medium, High bands.
 * 
 * @param {Object} signals
 * @param {boolean} signals.vtDetections - Detections present on VirusTotal
 * @param {boolean} signals.haMalicious - Hybrid Analysis verdict is malicious
 * @param {boolean} signals.mbMatch - MalwareBazaar search returned a match
 * @param {boolean} signals.abuseScoreHigh - AbuseIPDB confidence score >= 75
 * @returns {{ score: number, band: string, breakdown: Object }}
 */
function calculateThreatScore(signals) {
  const breakdown = {
    virusTotalDetections: signals.vtDetections ? 40 : 0,
    hybridAnalysisMalicious: signals.haMalicious ? 30 : 0,
    malwareBazaarMatch: signals.mbMatch ? 20 : 0,
    abuseIpdbConfidenceHigh: signals.abuseScoreHigh ? 10 : 0
  };

  let score = Object.values(breakdown).reduce((sum, val) => sum + val, 0);

  // Clamp to 0-100 (though the max is already 100)
  score = Math.max(0, Math.min(100, score));

  let band = 'Safe';
  if (score > 75) {
    band = 'High';
  } else if (score > 50) {
    band = 'Medium';
  } else if (score > 25) {
    band = 'Low';
  }

  return {
    score,
    band,
    breakdown
  };
}

module.exports = { calculateThreatScore };
