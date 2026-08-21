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

  // 3. Extract dynamic confidence/completeness metrics from the SecurityEngine
  const confidence = typeof engineEvidence.confidence === 'number' ? engineEvidence.confidence : 0.95;
  const completeness = typeof engineEvidence.completeness === 'number' ? engineEvidence.completeness : 0.90;

  // 4. Aggregate recommended remediations & AI Executive Summary
  let recommendationSummary = '';
  let aiExecutiveSummary = '';

  switch (riskLevel) {
    case 'CRITICAL':
      recommendationSummary = 'Critical threat indicators detected. Immediate action required. Domain exhibits severe malicious behavior, such as brand impersonation, credential harvesting, or active malware hosting. Blacklist and take down the target immediately.';
      aiExecutiveSummary = 'CRITICAL THREAT: Automated forensic synthesis confirms active exploitation indicators on this target. Immediate blocking and blacklisting recommended.';
      break;
    case 'HIGH':
      recommendationSummary = 'High-risk threat indicators detected. The target exhibits suspicious infrastructure, untrusted certificates, or significant security hygiene failures. Consider blocking or restricting access until further manual review.';
      aiExecutiveSummary = 'ELEVATED RISK: Threat telemetry flags significant infrastructure or certificate warnings. Proceed with extreme caution and restrict access.';
      break;
    case 'MEDIUM':
      recommendationSummary = 'Moderate risk detected. The target lacks standard security protocols, uses suspicious tracking, or triggers minor threat warnings. Proceed with caution and monitor telemetry.';
      aiExecutiveSummary = 'MODERATE RISK: Target exhibits anomalous behavior or poor security posture. Recommend monitoring telemetry before granting broad access.';
      break;
    case 'LOW':
    default:
      if (findings.length > 0) {
        recommendationSummary = 'Low risk detected. The target exhibits minor informational findings (e.g. missing security headers), but no active phishing or malicious infrastructure was found. Safe to proceed.';
        aiExecutiveSummary = 'LOW RISK / INFORMATIONAL: Target exhibits minor hygiene issues (like missing headers), but core infrastructure and trademark telemetry verified clean. Safe to proceed.';
      } else {
        recommendationSummary = 'No active threat findings detected. The target maintains strong security posture and verified infrastructure. Safe to proceed.';
        aiExecutiveSummary = 'VERIFIED CLEAN: Telemetry synthesis confirms strong security posture and verified infrastructure. No trademark collision or active threats detected.';
      }
      break;
  }

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
    aiExecutiveSummary,
    rulebookVersion: '1.0'
  };
};

export default {
  calculateRiskResult
};
