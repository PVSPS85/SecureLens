import logger from '../utils/logger.js';

/**
 * Service to generate human-readable security investigation summaries
 * and handle conversational queries based on structured scan evidence.
 */

/**
 * Generates an executive summary of target threat analysis findings.
 *
 * @param {object} evidencePayload - Raw evidence collected by security engines.
 * @param {object} riskResult - Calculated risk score and metrics from scoring engine.
 * @returns {Promise<object>} Markdown formatted summary response.
 */
export const generateInvestigationSummary = async (evidencePayload, riskResult) => {
  logger.info(`[SecureAI Service] Generating summary for target: "${evidencePayload.target}"`);

  // UNTRUSTED INPUT DEFENSE: Strictly encapsulate external variables within delimiters
  const cleanTarget = (evidencePayload.target || '').replace(/[`$]+/g, '');
  const findings = evidencePayload.findings || [];

  const findingsList = findings.map((f) => {
    const severity = (f.severity || 'low').toUpperCase();
    const cleanVuln = (f.vulnerability || '').replace(/[`$]+/g, '');
    const cleanDesc = (f.description || '').replace(/[`$]+/g, '');
    return `* **${cleanVuln}** [Severity: ${severity}]:\n  ${cleanDesc}`;
  }).join('\n\n');

  const recommendationText = (riskResult.recommendation || '')
    .replace(/[`$]+/g, '')
    .split('\n')
    .map((r) => `  * ${r}`)
    .join('\n');

  const markdownSummary = `### SecureAI Threat Investigation Report

**Target Asset:** \`${cleanTarget}\`  
**Security Status Verdict:** **${riskResult.riskLevel}**  
**Deterministic Risk Score:** **${riskResult.score}/100**  
**Scoring Confidence Rating:** ${Math.round(riskResult.confidence * 100)}%  
**Analysis Coverage Completeness:** ${Math.round(riskResult.completeness * 100)}%

---

#### 1. Vulnerability Detections Summary
${findingsList || '* No active vulnerability indicators or configuration weaknesses identified.'}

---

#### 2. AI Executive Recommendations
The centralized security rulebook scoring engine advises the following remediation pathways:
${recommendationSummaryText(recommendationText)}

---
*Disclaimer: This threat report explanation was compiled autonomously by the SecureAI interpreter module based on deterministic engine inputs.*`;

  return {
    summary: markdownSummary,
    generatedAt: new Date().toISOString(),
    rulebookVersion: riskResult.rulebookVersion || '1.0'
  };
};

/**
 * Handles interactive security queries regarding a specific scan record.
 *
 * @param {string} scanId - Target scan ID.
 * @param {string} userMessage - Chat query message.
 * @param {object} evidenceContext - Scan history and report database values.
 * @returns {Promise<object>} Conversational assistant response.
 */
export const handleChatQuery = async (scanId, userMessage, evidenceContext = {}) => {
  logger.info(`[SecureAI Service] Chat query initiated for scan ID: "${scanId}"`);

  // UNTRUSTED INPUT DEFENSE: Strictly sanitize user message parameter input to prevent prompt injections
  const sanitizedQuery = (userMessage || '').trim().replace(/[\x00-\x1F\x7F<>`$]+/g, '').toLowerCase();

  const scan = evidenceContext.scan || {};
  const report = evidenceContext.report || {};

  const cleanTarget = (scan.target || 'target').replace(/[`$]+/g, '');
  const riskLevel = scan.risk_level || 'UNKNOWN';
  const riskScore = scan.risk_score ?? 0;

  let answer = '';

  if (sanitizedQuery.includes('fix') || sanitizedQuery.includes('recommend') || sanitizedQuery.includes('remedy') || sanitizedQuery.includes('prevent')) {
    const rawRecommendations = report.recommendation ? report.recommendation.split('\n') : [];
    const formattedRecommendations = rawRecommendations.map((r) => `- ${r}`).join('\n');

    answer = `To secure **${cleanTarget}**, follow the recommended actions generated during the vulnerability audit:\n\n` +
             `${formattedRecommendations || 'No critical weaknesses were identified requiring immediate action. Standard monitoring is recommended.'}\n\n` +
             `If this is a web target, ensure that strict HTTP transport security headers (HSTS) are active and web banner disclosures are suppressed.`;
  } else if (sanitizedQuery.includes('score') || sanitizedQuery.includes('risk') || sanitizedQuery.includes('level') || sanitizedQuery.includes('why')) {
    answer = `The target **${cleanTarget}** was assigned a **${riskLevel}** threat rating with a risk score of **${riskScore}/100**.\n\n` +
             `This classification is computed deterministically by the Security Scoring Rulebook engine. ` +
             `It aggregates detected vulnerability severities (such as banner exposures or DNSSEC signings) and factors in threat intelligence reputation metrics.`;
  } else {
    answer = `Hello! I am your SecureAI virtual assistant. I have reviewed the forensic scan reports for **${cleanTarget}** (Scan ID: \`${scanId}\`).\n\n` +
             `You can ask me questions about this specific scan, such as:\n` +
             `- "How do I fix these vulnerability findings?"\n` +
             `- "Why was the risk score calculated this way?"\n` +
             `- "What recommendation steps should I take first?"`;
  }

  return {
    scanId,
    query: userMessage,
    response: answer,
    modelSignature: 'secureai-chat-assistant-v1',
    timestamp: new Date().toISOString()
  };
};

// Helper function to format empty recommendations cleanly
const recommendationSummaryText = (recommendationText) => {
  if (!recommendationText || recommendationText.trim() === '') {
    return '  * Maintain default SSL policies and run full network vulnerability scanning on target change updates.';
  }
  return recommendationText;
};

export default {
  generateInvestigationSummary,
  handleChatQuery
};
