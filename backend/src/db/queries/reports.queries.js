import supabase from '../client.js';
import logger from '../../utils/logger.js';

// In-memory fallback report store
const memoryReports = new Map();

/**
 * Inserts or updates the final authoritative scan report.
 *
 * @param {object} reportData - Structural report content.
 * @returns {Promise<object>} The inserted report record row.
 */
export const insertReport = async (reportData) => {
  const fallbackReport = {
    scan_id: reportData.scanId,
    summary: reportData.summary,
    findings: reportData.findings || [],
    infrastructure: reportData.infrastructure || {},
    recommendation: reportData.recommendation,
    timeline: reportData.timeline || [],
    rulebook_version: reportData.rulebookVersion || '1.0.0',
    created_at: new Date().toISOString()
  };

  memoryReports.set(reportData.scanId, fallbackReport);

  try {
    logger.info(`[Database Reports] Saving report findings for scan ID: "${reportData.scanId}"`);

    // Use upsert to handle case where a report might already exist
    const { data, error } = await supabase
      .from('reports')
      .upsert({
        scan_id: reportData.scanId,
        summary: reportData.summary,
        findings: reportData.findings || [],
        infrastructure: reportData.infrastructure || {},
        recommendation: reportData.recommendation,
        timeline: reportData.timeline || [],
        rulebook_version: reportData.rulebookVersion || '1.0.0'
      }, {
        onConflict: 'scan_id'
      })
      .select()
      .single();

    if (error) {
      logger.warn(`[Database Reports] Supabase report upsert failed (${error.message}). Using in-memory report store.`);
      return fallbackReport;
    }
    memoryReports.set(reportData.scanId, data);
    return data;
  } catch (error) {
    logger.warn(`[Database Reports] Exception in insertReport (${error.message}). Using in-memory report store.`);
    return fallbackReport;
  }
};

/**
 * Fetches the forensic report matching the target scan ID.
 *
 * @param {string} scanId - Target scan identifier.
 * @returns {Promise<object|null>} Report record row, or null.
 */
export const getReportByScanId = async (scanId) => {
  try {
    logger.info(`[Database Reports] Fetching report details for scan ID: "${scanId}"`);

    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('scan_id', scanId)
      .maybeSingle();

    if (error || !data) {
      return memoryReports.get(scanId) || null;
    }
    return data;
  } catch (error) {
    return memoryReports.get(scanId) || null;
  }
};

/**
 * Updates the summary field of a report by its scan ID.
 * Uses upsert to handle cases where the report row might not exist yet.
 *
 * @param {string} scanId - Target scan identifier.
 * @param {string} summaryText - Generated AI summary text.
 * @returns {Promise<object>} Updated or inserted report row.
 */
export const updateReportSummary = async (scanId, summaryText) => {
  const mem = memoryReports.get(scanId) || { scan_id: scanId };
  mem.summary = summaryText;
  memoryReports.set(scanId, mem);

  try {
    logger.info(`[Database Reports] Updating summary for scan ID: "${scanId}"`);

    const { data, error } = await supabase
      .from('reports')
      .upsert({
        scan_id: scanId,
        summary: summaryText
      }, {
        onConflict: 'scan_id'
      })
      .select()
      .single();

    if (error) return mem;
    return data;
  } catch (error) {
    return mem;
  }
};

export default {
  insertReport,
  getReportByScanId,
  updateReportSummary
};
