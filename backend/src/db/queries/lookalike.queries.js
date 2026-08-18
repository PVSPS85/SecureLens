import supabase from '../client.js';
import logger from '../../utils/logger.js';

/**
 * Fetches lookalike domain alerts with pagination and filtration.
 *
 * @param {object} filters - Filtration keys (risk, status).
 * @param {number} [page=1] - Pagination page.
 * @param {number} [limit=10] - Records limit per page.
 * @returns {Promise<object>} Paginated alerts results.
 */
export const getLookalikeAlerts = async (filters = {}, page = 1, limit = 10) => {
  try {
    const offset = (page - 1) * limit;
    logger.info(`[Database Lookalikes] Querying alerts | Page: ${page} | Limit: ${limit}`);

    let query = supabase
      .from('lookalike_alerts')
      .select('*', { count: 'exact' })
      .order('detected_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (filters.risk) {
      query = query.eq('risk_level', filters.risk.toUpperCase());
    }

    if (filters.status) {
      query = query.eq('status', filters.status.toLowerCase());
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
    logger.error(`[Database Lookalikes] Error in getLookalikeAlerts: ${error.message}`);
    throw new Error(`Database error: Failed to retrieve lookalike alerts. Details: ${error.message}`);
  }
};

/**
 * Inserts a newly flagged lookalike threat domain alert.
 *
 * @param {object} alertData - Lookalike threat domain data.
 * @returns {Promise<object>} The inserted lookalike alert row.
 */
export const insertLookalikeAlert = async (alertData) => {
  try {
    logger.info(`[Database Lookalikes] Flagging lookalike candidate domain: "${alertData.candidateDomain}"`);

    const { data, error } = await supabase
      .from('lookalike_alerts')
      .insert({
        candidate_domain: alertData.candidateDomain,
        matched_brand: alertData.matchedBrand,
        similarity_score: alertData.similarityScore,
        risk_level: alertData.riskLevel || 'unknown',
        detection_type: alertData.detectionType,
        status: alertData.status || 'active',
        evidence_summary: alertData.evidenceSummary || {}
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    logger.error(`[Database Lookalikes] Error in insertLookalikeAlert: ${error.message}`);
    throw new Error(`Database error: Failed to insert lookalike alert. Details: ${error.message}`);
  }
};

export default {
  getLookalikeAlerts,
  insertLookalikeAlert
};
