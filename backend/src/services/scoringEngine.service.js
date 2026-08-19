import logger from '../utils/logger.js';
import RulebookEngine from '../../../securityEngine/rulebook/rulebook.engine.js';

/**
 * Authoritative Rulebook Security Scoring Engine.
 * Computes risk scores and levels based on gathered evidence payloads.
 */

/**
 * Calculates risk scores, levels, and failed check boundaries from evidence.
 * Strict, deterministic computation adhering to the SecureLens Security Scoring Rulebook.
 *
 * @param {object} engineEvidence - The wrapper containing the EvidenceContract under .evidence
 * @returns {object} Formal RiskResult metadata block.
 */
export const calculateRiskResult = (engineEvidence = {}) => {
  logger.info('[Scoring Engine] Resolving threat weights for evidence target.');

  // The scan.controller passes { analyzedAt, metadata, evidence: <EvidenceContract> }
  // We need the inner evidence payload for the rulebook.
  const evidencePayload = engineEvidence.evidence || engineEvidence;

  // 1. Evaluate risk using the authoritative Paranoia Mode Rulebook Engine
  const { riskScore, riskLevel, detectedRisks } = RulebookEngine.evaluate(evidencePayload);

  // 2. Map rulebook detectedRisks strings into structured frontend findings
  const findings = detectedRisks.map((riskStr) => {
    let severity = 'low';
    if (riskStr.startsWith('INSTANT_100:') || riskStr.startsWith('CRITICAL:')) {
      severity = 'critical';
    } else if (riskStr.startsWith('COMPOUND:')) {
      severity = 'critical'; // Compound phishing indicators are critical
    } else if (riskStr.startsWith('HIGH:')) {
      severity = 'high';
    } else if (riskStr.startsWith('MEDIUM:')) {
      severity = 'medium';
    }

    // Strip the prefix for the description
    const description = riskStr.replace(/^(INSTANT_100|CRITICAL|COMPOUND|HIGH|MEDIUM):\s*/i, '').trim();
    
    return {
      id: `rule-${Math.random().toString(36).substring(2, 9)}`,
      severity,
      vulnerability: description.split('—')[0].trim() || 'Security Risk Detected',
      description,
      recommendation: 'Review rulebook engine documentation for remediation.'
    };
  });

  // 3. Set confidence/completeness mock metrics
  const confidence = 0.95;
  const completeness = 0.90;

  // 4. Aggregate recommended remediations
  const recommendationSummary = findings.length > 0
    ? 'High-risk threat indicators detected. Please review the detailed findings and consider blocking or taking down the target.'
    : 'No active threat findings detected. Maintain default system security headers and SSL configurations.';

  const failedChecks = findings.filter(f => f.severity === 'critical' || f.severity === 'high');

  logger.info(`[Scoring Engine] Evaluation complete. Score: ${riskScore} | Level: ${riskLevel} | Failed Checks: ${failedChecks.length}`);

  return {
    score: riskScore,
    riskLevel,
    confidence,
    completeness,
    findings,
    warnings: [],
    failedChecks,
    recommendation: recommendationSummary,
    rulebookVersion: '1.0'
  };
};

export default {
  calculateRiskResult
};
