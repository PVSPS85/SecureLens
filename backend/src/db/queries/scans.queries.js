import supabase from '../client.js';
import logger from '../../utils/logger.js';

/**
 * Inserts a new scan log tracking record.
 *
 * @param {object} scanData - Target and type options.
 * @returns {Promise<object>} The inserted scan record row.
 */
export const insertScan = async (scanData) => {
  try {
    logger.info(`[Database Scans] Inserting scan record for target: "${scanData.target}"`);

    const { data, error } = await supabase
      .from('scans')
      .insert({
        user_id: scanData.userId || null,
        target: scanData.target,
        normalized_target: scanData.normalizedTarget,
        target_type: scanData.targetType,
        source: scanData.source,
        status: scanData.status || 'queued',
        risk_level: scanData.riskLevel || 'unknown',
        risk_score: scanData.riskScore || 0
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    logger.error(`[Database Scans] Error in insertScan: ${error.message}`);
    throw new Error(`Database error: Failed to initialize scan record. Details: ${error.message}`);
  }
};

/**
 * Updates scan status and risk verdict options.
 *
 * @param {string} scanId - Target scan identifier.
 * @param {string} status - New scan status.
 * @param {number} riskScore - Calculated risk score.
 * @param {string} riskLevel - Calculated risk level verdict.
 * @returns {Promise<object>} The updated scan record row.
 */
export const updateScanStatus = async (scanId, status, riskScore, riskLevel) => {
  try {
    logger.info(`[Database Scans] Updating scan status for ID: "${scanId}" to "${status}"`);

    const { data, error } = await supabase
      .from('scans')
      .update({
        status,
        risk_score: riskScore,
        risk_level: riskLevel,
        updated_at: new Date().toISOString()
      })
      .eq('id', scanId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    logger.error(`[Database Scans] Error in updateScanStatus: ${error.message}`);
    throw new Error(`Database error: Failed to update scan status. Details: ${error.message}`);
  }
};

/**
 * Fetches a single scan tracking record by ID.
 *
 * @param {string} scanId - Target scan identifier.
 * @returns {Promise<object|null>} The scan record row, or null.
 */
export const getScanById = async (scanId) => {
  try {
    logger.info(`[Database Scans] Fetching scan record for ID: "${scanId}"`);

    const { data, error } = await supabase
      .from('scans')
      .select('*')
      .eq('id', scanId)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (error) {
    logger.error(`[Database Scans] Error in getScanById: ${error.message}`);
    throw new Error(`Database error: Failed to retrieve scan record. Details: ${error.message}`);
  }
};

/**
 * Queries scans filtered by user ID, support risk filtering and pagination.
 *
 * @param {string} userId - User UUID index.
 * @param {object} options - Filters and pagination settings.
 * @returns {Promise<object>} Paginated list of scans.
 */
export const getUserScanHistory = async (userId, options = {}) => {
  try {
    const page = parseInt(options.page, 10) || 1;
    const limit = parseInt(options.limit, 10) || 10;
    const offset = (page - 1) * limit;

    logger.info(`[Database Scans] Querying scan history for user: "${userId}" | Page: ${page} | Limit: ${limit}`);

    let query = supabase
      .from('scans')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (options.risk) {
      query = query.eq('risk_level', options.risk);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      data: data || [],
      pagination: {
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit)
      }
    };
  } catch (error) {
    logger.error(`[Database Scans] Error in getUserScanHistory: ${error.message}`);
    throw new Error(`Database error: Failed to retrieve user scan history. Details: ${error.message}`);
  }
};

export default {
  insertScan,
  updateScanStatus,
  getScanById,
  getUserScanHistory
};
