import logger from '../utils/logger.js';

/**
 * Authoritative Rulebook Security Scoring Engine.
 * Computes risk scores and levels based on gathered evidence payloads.
 */

/**
 * Calculates risk scores, levels, and failed check boundaries from evidence.
 * Strict, deterministic computation adhering to the SecureLens Security Scoring Rulebook.
 *
 * @param {object} evidencePayload - Gathered evidence records.
 * @returns {object} Formal RiskResult metadata block.
 */
export const calculateRiskResult = (evidencePayload = {}) => {
  logger.info('[Scoring Engine] Resolving threat weights for evidence target.');

  const findings = evidencePayload.findings || [];
  const warnings = evidencePayload.warnings || [];
  const confidence = evidencePayload.confidence ?? 1.0;
  const completeness = evidencePayload.completeness ?? 1.0;

  let baseScore = 0;
  const failedChecks = [];

  // 1. Evaluate individual vulnerability findings
  findings.forEach((finding) => {
    const severity = (finding.severity || 'low').toLowerCase();

    if (severity === 'critical') {
      baseScore += 40;
      failedChecks.push(finding);
    } else if (severity === 'high') {
      baseScore += 25;
      failedChecks.push(finding);
    } else if (severity === 'medium') {
      baseScore += 15;
      failedChecks.push(finding);
    } else if (severity === 'low') {
      baseScore += 5;
    }
  });

  // 2. Evaluate custom threat intelligence or lookalike overrides
  const threatIntel = (evidencePayload.threatIntel || '').toLowerCase();
  const visualSimilarity = parseFloat(evidencePayload.visualSimilarity) || 0;
  const hasLoginForm = !!evidencePayload.hasLoginForm;

  if (threatIntel === 'confirmed match') {
    logger.warn('[Scoring Engine] Threat intelligence override: Confirmed malicious target match.');
    baseScore += 80;
  }

  if (visualSimilarity >= 90 && hasLoginForm) {
    logger.warn('[Scoring Engine] Visual similarity override: High brand likeness with input login fields.');
    baseScore += 70;
  }

  // 3. Enforce validation boundaries on risk score limits
  const score = Math.max(0, Math.min(100, Math.round(baseScore)));

  // 4. Map score ranges to formal risk levels
  let riskLevel = 'LOW';
  if (score >= 80) {
    riskLevel = 'CRITICAL';
  } else if (score >= 60) {
    riskLevel = 'HIGH';
  } else if (score >= 30) {
    riskLevel = 'MEDIUM';
  }

  // 5. Aggregate recommended remediations
  const recommendations = findings.map((f) => f.recommendation || '').filter(Boolean);
  const recommendationSummary = recommendations.length > 0
    ? recommendations.join('\n')
    : 'No active threat findings detected. Maintain default system security headers and SSL configurations.';

  logger.info(`[Scoring Engine] Evaluation complete. Score: ${score} | Level: ${riskLevel} | Failed Checks: ${failedChecks.length}`);

  return {
    score,
    riskLevel,
    confidence,
    completeness,
    findings,
    warnings,
    failedChecks,
    recommendation: recommendationSummary,
    rulebookVersion: '1.0'
  };
};

export default {
  calculateRiskResult
};
