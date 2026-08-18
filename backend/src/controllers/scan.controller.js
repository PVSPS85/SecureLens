import { scanStorageService } from '../services/scanStorage.service.js';

// Matches standard RFC 4122 UUID v4 syntax
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[45][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Initiates a manual vulnerability scan.
 * Receives validated inputs from req.validatedTarget.
 */
export const startScan = (req, res) => {
  const { target, type, details } = req.validatedTarget;

  try {
    // Sanitize and strictly map database inputs
    const scanId = scanStorageService.createScan(target, type, details);

    res.status(201).json({
      success: true,
      message: 'Scan execution successfully initiated.',
      data: {
        scanId,
        status: 'created',
        target
      }
    });
  } catch (error) {
    // Centralized error handler catches this
    throw error;
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

export default {
  startScan,
  getScanStatus,
  getScanReport
};
