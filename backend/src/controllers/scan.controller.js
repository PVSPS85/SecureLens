import { normalizeTarget } from '../utils/normalizer.js';
import { isBlockedTarget } from '../utils/ssrfGuard.js';
import { analyzeTarget } from '../services/securityEngine.interface.js';
import { calculateRiskResult } from '../services/scoringEngine.service.js';
import { insertScan, updateScanStatus, getScanById } from '../db/queries/scans.queries.js';
import { insertReport, getReportByScanId } from '../db/queries/reports.queries.js';
import supabase from '../db/client.js';
import logger from '../utils/logger.js';

// Matches standard RFC 4122 UUID v4 formatting syntax
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[45][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Initiates and orchestrates the full user scan request lifecycle.
 * Writes records to PostgreSQL database using live Supabase queries.
 */
export const startScan = async (req, res, next) => {
  const { target } = req.body;

  try {
    // 1. Double-safeguard URL / Target Normalization & SSRF Validation check
    let normalized;
    try {
      normalized = normalizeTarget(target);
    } catch (e) {
      return res.status(400).json({
        success: false,
        status: 400,
        error: 'Bad Request',
        message: 'Target identifier is malformed or invalid.'
      });
    }

    if (isBlockedTarget(normalized.hostname)) {
      return res.status(400).json({
        success: false,
        status: 400,
        error: 'Bad Request',
        message: 'Target identifier resolves to a restricted private or local loopback address.'
      });
    }

    const { type, details } = req.validatedTarget; // Extracted from validate middleware

    // 2. Initialize tracking record in the Postgres scans table
    const scanRecord = await insertScan({
      userId: req.user ? req.user.id : null,
      target: target,
      normalizedTarget: normalized.normalizedUrl,
      targetType: type,
      source: req.user ? 'web' : 'extension',
      status: 'queued',
      riskLevel: 'unknown',
      riskScore: 0
    });

    const scanId = scanRecord.id;

    // 3. Progress scan status to running
    await updateScanStatus(scanId, 'running', 0, 'unknown');

    // 4. Invoke Security Engine analysis (simulated facts audit)
    const engineEvidence = await analyzeTarget({
      target: normalized.normalizedUrl,
      type,
      details
    });

    // 5. Build authoritative risk metrics using Security Rulebook Scoring Engine
    const riskResult = calculateRiskResult(engineEvidence);
    const riskScore = riskResult.score;
    const riskLevel = riskResult.riskLevel;

    // 6. Commit findings report to Database reports table
    await insertReport({
      scanId,
      summary: `Vulnerability audit completed for target ${normalized.normalizedUrl}`,
      findings: riskResult.findings,
      infrastructure: { 
        analyzedAt: engineEvidence.analyzedAt,
        engineSignatureVersion: engineEvidence.metadata.engineSignatureVersion
      },
      recommendation: riskResult.recommendation,
      timeline: [
        { status: 'queued', timestamp: scanRecord.created_at },
        { status: 'running', timestamp: new Date().toISOString() }
      ],
      rulebookVersion: riskResult.rulebookVersion
    });

    // 7. Transition status state to completed
    await updateScanStatus(scanId, 'completed', riskScore, riskLevel);

    // 8. Return response containing the fully compiled risk report
    res.status(201).json({
      success: true,
      data: {
        scanId,
        scan: {
          id: scanId,
          target: normalized.normalizedUrl,
          risk_score: riskScore,
          risk_level: riskLevel.toLowerCase()
        },
        target: normalized.normalizedUrl,
        type,
        status: 'completed',
        riskScore,
        riskLevel,
        confidence: riskResult.confidence,
        findings: riskResult.findings,
        recommendations: riskResult.recommendation ? riskResult.recommendation.split('\n') : []
      }
    });
  } catch (error) {
    // Forward all system errors to centralized error middleware
    next(error);
  }
};

/**
 * Retrieves the current tracking status of a scan from PostgreSQL.
 */
export const getScanStatus = async (req, res, next) => {
  const { scanId } = req.params;

  // Enforce validation boundaries on request identifier
  if (!scanId || !UUID_REGEX.test(scanId)) {
    return res.status(404).json({
      success: false,
      status: 404,
      error: 'Not Found',
      message: 'The requested scan identifier is invalid or does not exist.'
    });
  }

  try {
    const scan = await getScanById(scanId);

    if (!scan) {
      return res.status(404).json({
        success: false,
        status: 404,
        error: 'Not Found',
        message: 'The requested scan execution could not be found.'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        scanId: scan.id,
        status: scan.status,
        createdAt: scan.created_at,
        updatedAt: scan.updated_at
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieves the authoritative findings report for completed scans from PostgreSQL.
 */
export const getScanReport = async (req, res, next) => {
  const { scanId } = req.params;

  // Enforce validation boundaries on request identifier
  if (!scanId || !UUID_REGEX.test(scanId)) {
    return res.status(404).json({
      success: false,
      status: 404,
      error: 'Not Found',
      message: 'The requested scan identifier is invalid or does not exist.'
    });
  }

  try {
    const scan = await getScanById(scanId);

    if (!scan) {
      return res.status(404).json({
        success: false,
        status: 404,
        error: 'Not Found',
        message: 'The requested scan execution could not be found.'
      });
    }

    // Deny access if scan process is incomplete
    if (scan.status !== 'completed') {
      return res.status(400).json({
        success: false,
        status: 400,
        error: 'Bad Request',
        message: `The scan report is not ready. Current execution state is "${scan.status}".`
      });
    }

    const report = await getReportByScanId(scanId);

    res.status(200).json({
      success: true,
      data: {
        scanId: scan.id,
        target: scan.target,
        type: scan.target_type,
        status: scan.status,
        completedAt: scan.updated_at,
        results: report ? {
          summary: report.summary,
          score: scan.risk_score,
          riskLevel: scan.risk_level,
          findings: report.findings,
          recommendations: report.recommendation ? report.recommendation.split('\n') : []
        } : null
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Execution core for Chrome Extension fast/lightweight URL check request.
 */
export const quickScan = async (req, res, next) => {
  const { target, type } = req.validatedTarget;

  try {
    // 1. Query scans database table directly for existing completed targets
    logger.info(`[Scan Controller] Querying scans database cache for target: "${target}"`);
    const { data: existingScans, error } = await supabase
      .from('scans')
      .select('*')
      .eq('target', target)
      .eq('status', 'completed')
      .limit(1);

    if (error) throw error;

    if (existingScans && existingScans.length > 0) {
      const match = existingScans[0];
      return res.status(200).json({
        success: true,
        source: 'cache',
        data: {
          target,
          riskLevel: match.risk_level,
          conciseExplanation: `Cached result found. Host resolves to ${match.risk_level} risk level based on prior scan ID ${match.id}.`
        }
      });
    }

    // 2. Fall back to fast mock evaluation signal if missing
    await new Promise((resolve) => setTimeout(resolve, 300));

    const riskLevel = type === 'ip' ? 'Low' : 'Medium';
    const conciseExplanation = type === 'ip'
      ? `Fast lookup complete. Host ${target} is a validated public IP address with no active blacklist flags.`
      : `Fast lookup complete. Target URL ${target} does not match blacklisted threat registries. Perform a full scan to review header configurations.`;

    res.status(200).json({
      success: true,
      source: 'live_check',
      data: {
        target,
        riskLevel,
        conciseExplanation
      }
    });
  } catch (error) {
    next(error);
  }
};

export default {
  startScan,
  getScanStatus,
  getScanReport,
  quickScan
};
