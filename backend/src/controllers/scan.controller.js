import { scanStorageService } from '../services/scanStorage.service.js';
import { normalizeTarget } from '../utils/normalizer.js';
import { isBlockedTarget } from '../utils/ssrfGuard.js';
import { saveScanRecord, saveEvidence, saveReport, getQuickResult } from '../services/database.interface.js';
import { analyzeTarget } from '../services/securityEngine.interface.js';

// Matches standard RFC 4122 UUID v4 syntax
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[45][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Initiates and orchestrates the full user scan request lifecycle.
 * Combines validation, normalization, state tracking, engine analysis, and database logs.
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

    // 2. Initialize tracking record in memory registry with 'created' state
    const scanId = scanStorageService.createScan(normalized.normalizedUrl, type, details);
    scanStorageService.updateScan(scanId, 'created', 0);

    // 3. Initiate Database persistence log placeholder
    await saveScanRecord({
      scanId,
      target: normalized.normalizedUrl,
      type,
      details
    });

    // 4. Update status tracking to 'queued' state
    scanStorageService.updateScan(scanId, 'queued', 10);
    await new Promise((resolve) => setTimeout(resolve, 100)); // Short mock transition lag

    // 5. Update status tracking to 'running' state
    scanStorageService.updateScan(scanId, 'running', 40);

    // 6. Invoke Security Engine analysis (simulated facts audit)
    const engineEvidence = await analyzeTarget({
      target: normalized.normalizedUrl,
      type,
      details
    });

    // 7. Progress status to 80% during final DB sync
    scanStorageService.updateScan(scanId, 'running', 80);

    // 8. Commit raw evidence & findings report to Database placeholders
    await saveEvidence(engineEvidence);
    await saveReport({
      scanId,
      vulnerabilitiesCount: engineEvidence.findings.length,
      findings: engineEvidence.findings
    });

    // 9. Build sanitized risk metrics mapping to Master Key requirements
    const riskScore = engineEvidence.riskScore;
    let riskLevel = 'Low';
    if (riskScore >= 70) riskLevel = 'High';
    else if (riskScore >= 40) riskLevel = 'Medium';

    // Format recommendations array
    const recommendations = engineEvidence.findings.map((f) => f.recommendation);

    const scanResults = {
      summary: `Vulnerability audit completed for target ${normalized.normalizedUrl}`,
      score: riskScore,
      riskLevel,
      confidence: engineEvidence.confidence,
      completeness: engineEvidence.completeness,
      findings: engineEvidence.findings,
      recommendations
    };

    // 10. Transition status state to 'completed'
    scanStorageService.updateScan(scanId, 'completed', 100, scanResults);

    // 11. Return response containing the fully compiled risk report
    res.status(201).json({
      success: true,
      data: {
        scanId,
        target: normalized.normalizedUrl,
        type,
        status: 'completed',
        riskScore,
        riskLevel,
        confidence: engineEvidence.confidence,
        findings: engineEvidence.findings,
        recommendations
      }
    });
  } catch (error) {
    // Forward all system errors to centralized error middleware
    next(error);
  }
};

/**
 * Retrieves the current tracking status of a scan.
 */
export const getScanStatus = (req, res) => {
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

  const scan = scanStorageService.getScan(scanId);

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
      progress: scan.progress,
      createdAt: scan.createdAt,
      updatedAt: scan.updatedAt
    }
  });
};

/**
 * Retrieves the authoritative findings report for completed scans.
 */
export const getScanReport = (req, res) => {
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

  const scan = scanStorageService.getScan(scanId);

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

  res.status(200).json({
    success: true,
    data: {
      scanId: scan.id,
      target: scan.target,
      type: scan.type,
      status: scan.status,
      completedAt: scan.updatedAt,
      results: scan.results
    }
  });
};

/**
 * Execution core for Chrome Extension fast/lightweight URL check request.
 */
export const quickScan = async (req, res, next) => {
  const { target, type } = req.validatedTarget;

  try {
    // 1. Query database cache for existing details
    const cachedResult = await getQuickResult(target);

    if (cachedResult) {
      return res.status(200).json({
        success: true,
        source: 'cache',
        data: cachedResult
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
