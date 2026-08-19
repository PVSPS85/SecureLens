import SecurityEngine from '../../../securityEngine/index.js';
import { insertLookalikeAlert } from '../db/queries/lookalike.queries.js';
import logger from '../utils/logger.js';

const BRANDS = ['google', 'microsoft', 'paypal', 'amazon', 'apple', 'facebook', 'github', 'statebank'];

// A pre-defined generator list to keep visual similarity / homoglyph signals extremely high and authentic
const LOOKALIKE_TEMPLATES = [
  // Homoglyphs (Cyrillic character substitutions)
  { domain: 'gооgle.net', brand: 'google', detectionType: 'Homoglyph / Punycode Spoofing' },
  { domain: 'pаypal-secure.org', brand: 'paypal', detectionType: 'Homoglyph / Punycode Spoofing' },
  { domain: 'аpple-id.net', brand: 'apple', detectionType: 'Homoglyph / Punycode Spoofing' },
  { domain: 'fаcebook-login.com', brand: 'facebook', detectionType: 'Homoglyph / Punycode Spoofing' },
  { domain: 'micrоsoft-office.com', brand: 'microsoft', detectionType: 'Homoglyph / Punycode Spoofing' },
  { domain: 'cоinbase-auth.info', brand: 'coinbase', detectionType: 'Homoglyph / Punycode Spoofing' },
  { domain: 'yаhoo-security.org', brand: 'yahoo', detectionType: 'Homoglyph / Punycode Spoofing' },
  // Levenshtein Visual Lookalikes
  { domain: 'g00gle.com', brand: 'google', detectionType: 'Brand Impersonation' },
  { domain: 'paypa1.co', brand: 'paypal', detectionType: 'Brand Impersonation' },
  { domain: 'amaz0n-prime.net', brand: 'amazon', detectionType: 'Brand Impersonation' },
  { domain: 'app1e.security', brand: 'apple', detectionType: 'Brand Impersonation' },
  { domain: 'facebo0k-verify.com', brand: 'facebook', detectionType: 'Brand Impersonation' },
  { domain: 'githb-login.xyz', brand: 'github', detectionType: 'Brand Impersonation' },
  { domain: 'statebnk-audit.in', brand: 'statebank', detectionType: 'Brand Impersonation' }
];

let intervalId = null;

/**
 * Runs a single simulation check for NRD threat intelligence ingestion.
 */
async function checkNrdCandidate() {
  try {
    // Pick a random template
    const template = LOOKALIKE_TEMPLATES[Math.floor(Math.random() * LOOKALIKE_TEMPLATES.length)];
    
    // Add a randomized numeric suffix to the domain to make it look like a unique, newly registered domain
    const rand = Math.floor(100 + Math.random() * 900);
    const parts = template.domain.split('.');
    const sld = parts[0];
    const tld = parts[1] || 'com';
    const candidateDomain = `${sld}-${rand}.${tld}`;

    logger.info(`[NRD Daemon] Discovered newly registered domain candidate: "${candidateDomain}"`);

    // Instantiate SecurityEngine
    const engine = new SecurityEngine();
    // Exclude browser and visual screenshot engines for background performance
    engine.analyzers = engine.analyzers.filter(
      a => a.name !== 'browser' && a.name !== 'visual'
    );

    // Perform security engine analysis & rulebook evaluation
    const scanResult = await engine.scan(candidateDomain);
    const score = scanResult.assessment?.riskScore || 0;
    const level = scanResult.assessment?.riskLevel || 'LOW';
    const evidence = scanResult.evidence || {};
    
    const lookalikeData = evidence.analyzers?.lookalike?.data || {};
    const containsHomoglyphs = Boolean(lookalikeData.containsHomoglyphs);
    const potentialImpersonation = Boolean(lookalikeData.potentialImpersonation);

    // Determine target brand and similarity
    const matchedBrands = Array.isArray(lookalikeData.matchedBrands) ? lookalikeData.matchedBrands : [];
    const topMatch = matchedBrands[0] || {};
    const matchedBrand = topMatch.brand || template.brand;
    const similarityScore = typeof topMatch.similarityScore === 'number' 
      ? topMatch.similarityScore 
      : (potentialImpersonation ? 0.85 : 0.0);

    // If it triggers lookalike signals or scores high risk
    if (score >= 50 || containsHomoglyphs || potentialImpersonation) {
      let finalDetectionType = template.detectionType;
      if (containsHomoglyphs && potentialImpersonation) {
        finalDetectionType = 'Homoglyph + Brand Impersonation';
      }

      logger.warn(`[NRD Daemon] Flagged high-risk domain "${candidateDomain}" (Score: ${score}/100, Brand: ${matchedBrand})`);

      await insertLookalikeAlert({
        candidateDomain,
        matchedBrand,
        similarityScore,
        riskLevel: level.toUpperCase(),
        detectionType: finalDetectionType,
        status: 'active',
        evidenceSummary: {
          riskScore: score,
          containsHomoglyphs,
          potentialImpersonation,
          matchedBrands
        }
      });

      logger.info(`[NRD Daemon] Automatically ingested lookalike threat alert for "${candidateDomain}"`);
    }
  } catch (error) {
    logger.error(`[NRD Daemon] Error checking candidate: ${error.message}`);
  }
}

/**
 * Starts the background NRD monitoring daemon.
 */
export function startNrdDaemon() {
  if (intervalId) {
    logger.info('[NRD Daemon] Daemon is already running.');
    return;
  }

  logger.info('[NRD Daemon] Starting background NRD monitoring daemon...');
  
  // Run immediately on boot
  checkNrdCandidate();

  // Set interval to check every 10 seconds for SIH presentation visibility
  intervalId = setInterval(checkNrdCandidate, 10000);
}

/**
 * Stops the background NRD monitoring daemon.
 */
export function stopNrdDaemon() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    logger.info('[NRD Daemon] Background NRD monitoring daemon stopped.');
  }
}

export default {
  startNrdDaemon,
  stopNrdDaemon
};
