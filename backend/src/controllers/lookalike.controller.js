import { getLookalikeAlerts as fetchAlerts } from '../db/queries/lookalike.queries.js';
import supabase from '../db/client.js';

// Matches standard RFC 4122 UUID v4 formatting syntax
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[45][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Retrieves a list of suspicious lookalike domain alerts for the threat dashboard.
 */
export const getLookalikeAlerts = async (req, res, next) => {
  try {
    let page = parseInt(req.query.page, 10) || 1;
    let limit = parseInt(req.query.limit, 10) || 10;
    const { risk, status } = req.query;

    // Sanitize parameters to prevent resource exhaustion
    if (page <= 0) page = 1;
    if (limit <= 0) limit = 10;
    if (limit > 250) limit = 250; // Cap maximum limit to 250 to allow fetching in chunks

    const filters = {};
    if (risk) filters.risk = risk;
    if (status) filters.status = status;

    const result = await fetchAlerts(filters, page, limit);

    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieves deep forensic details for a specific lookalike candidate alert from Supabase.
 */
export const getLookalikeAlertById = async (req, res, next) => {
  const { id } = req.params;

  try {
    // Validate UUID format parameters
    if (!id || !UUID_REGEX.test(id)) {
      return res.status(404).json({
        success: false,
        status: 404,
        error: 'Not Found',
        message: 'The requested alert identifier is invalid or does not exist.'
      });
    }

    const { data: alert, error } = await supabase
      .from('lookalike_alerts')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;

    if (!alert) {
      return res.status(404).json({
        success: false,
        status: 404,
        error: 'Not Found',
        message: 'The requested lookalike candidate alert could not be found.'
      });
    }

    res.status(200).json({
      success: true,
      data: alert
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getLookalikeAlerts,
  getLookalikeAlertById
};
