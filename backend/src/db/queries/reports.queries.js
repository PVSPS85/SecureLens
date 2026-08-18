import supabase from '../client.js';
import logger from '../../utils/logger.js';

/**
 * Inserts or updates the final authoritative scan report.
 *
 * @param {object} reportData - Structural report content.
 * @returns {Promise<object>} The inserted report record row.
 */
export const insertReport = async (reportData) => {
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

    if (error) throw error;
    return data;
  } catch (error) {
    logger.error(`[Database Reports] Error in insertReport: ${error.message}`);
    throw new Error(`Database error: Failed to persist forensic report. Details: ${error.message}`);
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

    if (error) throw error;
    return data;
  } catch (error) {
    logger.error(`[Database Reports] Error in getReportByScanId: ${error.message}`);
    throw new Error(`Database error: Failed to retrieve scan report. Details: ${error.message}`);
  }
};

export default {
  insertReport,
  getReportByScanId
};
