import crypto from 'crypto';
import logger from '../utils/logger.js';

/**
 * Provisional Database Interface.
 * Serves as a placeholder for Supabase/PostgreSQL persistence.
 */

/**
 * Saves the metadata of a new scan execution record.
 *
 * @param {object} scanData - Parameters containing target info and type.
 * @returns {Promise<object>} Record identification parameters.
 */
export const saveScanRecord = async (scanData) => {
  // Simulate network/database latency
  await new Promise((resolve) => setTimeout(resolve, 150));

  const recordId = crypto.randomUUID();
  logger.info(`[Provisional DB] saveScanRecord - Target: "${scanData.target}" | Type: "${scanData.type}" | Generated Record ID: ${recordId}`);

  return {
    success: true,
    id: recordId,
    timestamp: new Date().toISOString()
  };
};

/**
 * Saves the raw target analysis evidence payload.
 *
 * @param {object} evidenceData - Structured evidence parameters.
 * @returns {Promise<object>} Evidence record confirmation.
 */
export const saveEvidence = async (evidenceData) => {
  // Simulate database latency
  await new Promise((resolve) => setTimeout(resolve, 150));

  const evidenceId = crypto.randomUUID();
  logger.info(`[Provisional DB] saveEvidence - Confidence: ${evidenceData.confidence} | Completeness: ${evidenceData.completeness} | Generated Evidence ID: ${evidenceId}`);

  return {
    success: true,
    id: evidenceId,
    timestamp: new Date().toISOString()
  };
};

/**
 * Saves the finalized threat/vulnerability findings report.
 *
 * @param {object} reportData - Final findings parameters.
 * @returns {Promise<object>} Report record confirmation.
 */
export const saveReport = async (reportData) => {
  // Simulate database latency
  await new Promise((resolve) => setTimeout(resolve, 150));

  const reportId = crypto.randomUUID();
  logger.info(`[Provisional DB] saveReport - Vulnerabilities Found: ${reportData.vulnerabilitiesCount} | Generated Report ID: ${reportId}`);

  return {
    success: true,
    id: reportId,
    timestamp: new Date().toISOString()
  };
};

const mockHistoryRecords = [
  { id: '11111111-1111-1111-1111-111111111111', target: 'https://unsafe-site.com/', type: 'url', riskScore: 88, riskLevel: 'High', status: 'completed', createdAt: '2026-08-17T12:00:00Z' },
  { id: '22222222-2222-2222-2222-222222222222', target: 'https://example.com/', type: 'url', riskScore: 11, riskLevel: 'Low', status: 'completed', createdAt: '2026-08-17T13:30:00Z' },
  { id: '33333333-3333-3333-3333-333333333333', target: '8.8.8.8', type: 'ip', riskScore: 5, riskLevel: 'Low', status: 'completed', createdAt: '2026-08-18T01:15:00Z' },
  { id: '44444444-4444-4444-4444-444444444444', target: '198.51.100.42', type: 'ip', riskScore: 55, riskLevel: 'Medium', status: 'completed', createdAt: '2026-08-18T06:00:00Z' },
  { id: '55555555-5555-5555-5555-555555555555', target: 'https://google.com/', type: 'url', riskScore: 12, riskLevel: 'Low', status: 'completed', createdAt: '2026-08-18T07:13:00Z' }
];

/**
 * Queries database for a cached lightweight scan result.
 *
 * @param {string} target - The target URL/host.
 * @returns {Promise<object|null>} The lightweight risk signal or null.
 */
export const getQuickResult = async (target) => {
  await new Promise((resolve) => setTimeout(resolve, 80));
  logger.info(`[Provisional DB] getQuickResult - Querying for Target: "${target}"`);

  // Simulate a database cache hit for example.com
  if (target.includes('example.com')) {
    return {
      target,
      riskLevel: 'Low',
      conciseExplanation: 'Cached result found. Host exposes standard configuration and does not have known vulnerability listings.'
    };
  }

  return null;
};

/**
 * Retrieves a list of historical scan records.
 *
 * @param {object} filters - Key-value search filters (e.g. risk level).
 * @param {number} page - Pagination page.
 * @param {number} limit - Pagination limit.
 * @returns {Promise<object>} paginated scan records block.
 */
export const getHistory = async (filters = {}, page = 1, limit = 10) => {
  await new Promise((resolve) => setTimeout(resolve, 120));
  logger.info(`[Provisional DB] getHistory - Filters: ${JSON.stringify(filters)} | Page: ${page} | Limit: ${limit}`);

  let records = [...mockHistoryRecords];

  if (filters.risk) {
    const targetRisk = filters.risk.toUpperCase();
    records = records.filter((r) => r.riskLevel.toUpperCase() === targetRisk);
  }

  const startIndex = (page - 1) * limit;
  const paginated = records.slice(startIndex, startIndex + limit);

  return {
    data: paginated,
    pagination: {
      total: records.length,
      page,
      limit,
      totalPages: Math.ceil(records.length / limit)
    }
  };
};

const mockLookalikeAlerts = [
  {
    id: 'a1a1a1a1-a1a1-4a1a-a1a1-a1a1a1a1a1a1',
    domain: 'g00gle.com',
    brand: 'Google',
    similarityScore: 0.92,
    status: 'active',
    riskLevel: 'CRITICAL',
    detectedAt: '2026-08-18T05:00:00Z',
    evidence: {
      type: 'typosquatting',
      algorithm: 'Levenshtein Distance',
      distance: 1,
      mxRecords: ['127.0.0.1'],
      nSName: 'ns1.suspect-dns.org'
    }
  },
  {
    id: 'b2b2b2b2-b2b2-4b2b-b2b2-b2b2b2b2b2b2',
    domain: 'paypa1.co.uk',
    brand: 'PayPal',
    similarityScore: 0.89,
    status: 'active',
    riskLevel: 'HIGH',
    detectedAt: '2026-08-18T06:15:00Z',
    evidence: {
      type: 'homoglyph',
      algorithm: 'Confusable Mapping',
      confusables: { '1': 'l' },
      mxRecords: [],
      nSName: 'ns1.parked-domains.net'
    }
  },
  {
    id: 'c3c3c3c3-c3c3-4c3c-83c3-c3c3c3c3c3c3',
    domain: 'amaz0n-security.support',
    brand: 'Amazon',
    similarityScore: 0.78,
    status: 'resolved',
    riskLevel: 'MEDIUM',
    detectedAt: '2026-08-17T11:45:00Z',
    evidence: {
      type: 'combosquatting',
      algorithm: 'Keyword Appending',
      keywords: ['security', 'support'],
      mxRecords: ['mail.amaz0n-security.support'],
      nSName: 'ns1.webhost.com'
    }
  }
];

/**
 * Retrieves a list of suspicious lookalike domain alerts.
 *
 * @param {object} filters - Risk level or status filters.
 * @param {number} page - Pagination page.
 * @param {number} limit - Pagination limit.
 * @returns {Promise<object>} paginated alerts response.
 */
export const getLookalikeAlerts = async (filters = {}, page = 1, limit = 10) => {
  await new Promise((resolve) => setTimeout(resolve, 90));
  logger.info(`[Provisional DB] getLookalikeAlerts - Filters: ${JSON.stringify(filters)} | Page: ${page} | Limit: ${limit}`);

  let records = [...mockLookalikeAlerts];

  if (filters.risk) {
    const targetRisk = filters.risk.toUpperCase();
    records = records.filter((r) => r.riskLevel.toUpperCase() === targetRisk);
  }

  if (filters.status) {
    const targetStatus = filters.status.toLowerCase();
    records = records.filter((r) => r.status.toLowerCase() === targetStatus);
  }

  const startIndex = (page - 1) * limit;
  const paginated = records.slice(startIndex, startIndex + limit);

  return {
    data: paginated,
    pagination: {
      total: records.length,
      page,
      limit,
      totalPages: Math.ceil(records.length / limit)
    }
  };
};

/**
 * Retrieves deep forensic details for a specific lookalike candidate alert.
 *
 * @param {string} id - The alert unique identifier.
 * @returns {Promise<object|null>} Detailed lookalike candidate alert or null.
 */
export const getLookalikeAlertById = async (id) => {
  await new Promise((resolve) => setTimeout(resolve, 80));
  logger.info(`[Provisional DB] getLookalikeAlertById - Querying ID: ${id}`);
  return mockLookalikeAlerts.find((r) => r.id === id) || null;
};

export default {
  saveScanRecord,
  saveEvidence,
  saveReport,
  getQuickResult,
  getHistory,
  getLookalikeAlerts,
  getLookalikeAlertById
};
