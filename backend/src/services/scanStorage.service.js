import crypto from 'crypto';

class ScanStorageService {
  constructor() {
    this.scans = new Map();
  }

  /**
   * Initializes and logs a new scan execution record.
   *
   * @param {string} target - Normalized scan target identifier.
   * @param {string} type - Target classification: 'url', 'domain', 'ip', or 'brand_search'.
   * @param {object} details - Normalization component details.
   * @returns {string} The unique generated scanId token.
   */
  createScan(target, type, details) {
    const scanId = crypto.randomUUID();
    const now = new Date().toISOString();

    const scan = {
      id: scanId,
      target,
      type,
      details,
      status: 'created',
      progress: 0,
      createdAt: now,
      updatedAt: now,
      results: null
    };

    this.scans.set(scanId, scan);
    return scanId;
  }

  /**
   * Updates state parameters of a scan record.
   *
   * @param {string} scanId - Unique scan execution UUID.
   * @param {string} status - New state: 'created', 'queued', 'running', or 'completed'.
   * @param {number} progress - Progress percentage (0 - 100).
   * @param {object} [results] - Optional completed report findings payload.
   */
  updateScan(scanId, status, progress, results = null) {
    const scan = this.scans.get(scanId);
    if (scan) {
      scan.status = status;
      scan.progress = progress;
      scan.updatedAt = new Date().toISOString();
      if (results !== null) {
        scan.results = results;
      }
      this.scans.set(scanId, scan);
    }
  }

  /**
   * Fetches scan information from the registry.
   *
   * @param {string} scanId - Unique scan execution UUID.
   * @returns {object|null} Sanitized scan status record or null if not found.
   */
  getScan(scanId) {
    const scan = this.scans.get(scanId);
    if (!scan) return null;
    return { ...scan };
  }
}

export const scanStorageService = new ScanStorageService();
export default scanStorageService;
