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
    const now = new Date();

    const scan = {
      id: scanId,
      target,
      type,
      details,
      createdAt: now.toISOString(),
      startedAt: Date.now() // Reference timestamp for deterministic state simulation
    };

    this.scans.set(scanId, scan);
    return scanId;
  }

  /**
   * Fetches scan information, calculating state progression in real time.
   *
   * State machine transitions over elapsed time:
   * - < 2s: 'created' (progress 0)
   * - 2s to 5s: 'queued' (progress 10)
   * - 5s to 10s: 'running' (progress scales 50% -> 99%)
   * - >= 10s: 'completed' (progress 100%, returns mock analysis report payload)
   *
   * @param {string} scanId - Unique scan execution UUID.
   * @returns {object|null} Sanitized scan status record or null if not found.
   */
  getScan(scanId) {
    const scan = this.scans.get(scanId);
    if (!scan) return null;

    const elapsed = Date.now() - scan.startedAt;
    let status = 'created';
    let progress = 0;
    let results = null;

    if (elapsed >= 10000) {
      status = 'completed';
      progress = 100;
      results = {
        summary: `Vulnerability audit successfully completed for target ${scan.target}`,
        threatIntelChecked: true,
        vulnerabilitiesCount: 3,
        details: [
          {
            id: 'SL-001',
            severity: 'medium',
            vulnerability: 'Missing Security Headers',
            description: 'The target host is missing clickjacking protection headers (e.g., X-Frame-Options or Content-Security-Policy frame-ancestors directive).',
            recommendation: 'Configure header policies to prevent unauthorized embedding of pages.'
          },
          {
            id: 'SL-002',
            severity: 'low',
            vulnerability: 'Server Brand Banner Exposure',
            description: 'Response headers disclose server engine identifiers (e.g., nginx/apache versions), exposing system information to attackers.',
            recommendation: 'Modify configurations to strip server branding attributes (e.g., server_tokens off).'
          },
          {
            id: 'SL-003',
            severity: 'info',
            vulnerability: 'Permissive CORS Setup',
            description: 'Cross-Origin Resource Sharing matches flexible patterns. Ensure credentials authentication boundary is correctly locked down.',
            recommendation: 'Explicitly validate origin matches against an authorized whitelist.'
          }
        ]
      };
    } else if (elapsed >= 5000) {
      status = 'running';
      // Smoothly scale progress between 50 and 99
      progress = Math.min(Math.floor(50 + ((elapsed - 5000) / 5000) * 49), 99);
    } else if (elapsed >= 2000) {
      status = 'queued';
      progress = 10;
    } else {
      status = 'created';
      progress = 0;
    }

    return {
      id: scan.id,
      target: scan.target,
      type: scan.type,
      status,
      progress,
      createdAt: scan.createdAt,
      updatedAt: new Date(scan.startedAt + Math.min(elapsed, 10000)).toISOString(),
      results
    };
  }
}

export const scanStorageService = new ScanStorageService();
export default scanStorageService;
