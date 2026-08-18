import logger from '../utils/logger.js';

/**
 * Service orchestrating Newly Registered Domain (NRD) candidate ingestion feeds.
 * Simulates processing domains ingested from Shreshta Labs sources.
 */

/**
 * Simulates processing a batch feed of newly registered domains.
 * Executes deduplication checks, mock scoring, and routes detections.
 *
 * @param {Array<string>} candidates - Domain strings to process.
 * @returns {Promise<object>} Status report of processed feed block.
 */
export const processCandidateFeed = async (candidates = []) => {
  logger.info(`[NRD Ingestion] Initializing candidate ingestion pipeline batch. Candidates count: ${candidates.length}`);

  let ingestedCount = 0;
  let skippedCount = 0;
  const highRiskDetections = [];

  for (const domain of candidates) {
    if (!domain || typeof domain !== 'string') {
      skippedCount++;
      continue;
    }

    const trimmedDomain = domain.trim().toLowerCase();

    // 1. Mock deduplication filter checks
    if (trimmedDomain === 'google.com' || trimmedDomain === 'paypal.com' || trimmedDomain === 'amazon.com') {
      logger.info(`[NRD Ingestion] Deduplication check hit. Skipping legitimate domain: ${trimmedDomain}`);
      skippedCount++;
      continue;
    }

    // 2. Mock invoke similarity engine for lookalike scoring
    let isSuspect = false;
    let brand = '';
    let similarityScore = 0.0;

    if (trimmedDomain.includes('g00gle') || trimmedDomain.includes('goog1e')) {
      isSuspect = true;
      brand = 'Google';
      similarityScore = 0.93;
    } else if (trimmedDomain.includes('paypa1') || trimmedDomain.includes('paypal-login')) {
      isSuspect = true;
      brand = 'PayPal';
      similarityScore = 0.89;
    } else if (trimmedDomain.includes('amaz0n')) {
      isSuspect = true;
      brand = 'Amazon';
      similarityScore = 0.84;
    }

    // 3. Route high-risk results into the database interface
    if (isSuspect) {
      logger.warn(`[NRD Ingestion] Suspicious lookalike domain detected: "${trimmedDomain}" | Matched Brand: "${brand}" (Similarity: ${similarityScore})`);

      const riskLevel = similarityScore >= 0.90 ? 'CRITICAL' : 'HIGH';
      
      // Simulate Database save operation logging
      logger.info(`[NRD Ingestion] Routing alert info to Database - Domain: "${trimmedDomain}" | Risk: "${riskLevel}"`);

      ingestedCount++;
      highRiskDetections.push({
        domain: trimmedDomain,
        brand,
        similarityScore,
        riskLevel
      });
    } else {
      skippedCount++;
    }
  }

  logger.info(`[NRD Ingestion] Ingestion cycle completed. Ingested Alerts: ${ingestedCount} | Skipped/Processed: ${skippedCount}`);

  return {
    success: true,
    totalProcessed: candidates.length,
    ingestedCount,
    skippedCount,
    alerts: highRiskDetections
  };
};

export default {
  processCandidateFeed
};
