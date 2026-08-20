import { getLookalikeAlerts as fetchAlerts } from '../db/queries/lookalike.queries.js';
import { lookalikeCache } from '../db/cache.js';

// Matches standard RFC 4122 UUID v4 formatting syntax
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[45][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Retrieves lookalike domain alerts — served from cache instantly.
 */
export const getLookalikeAlerts = async (req, res) => {
  let page = parseInt(req.query.page, 10) || 1;
  let limit = parseInt(req.query.limit, 10) || 50;
  const { risk, status } = req.query;

  if (page <= 0) page = 1;
  if (limit <= 0) limit = 50;
  if (limit > 250) limit = 250;

  const filters = {};
  if (risk) filters.risk = risk;
  if (status) filters.status = status;

  // ✅ Serves from in-memory cache — instant response, 0ms latency
  const result = await fetchAlerts(filters, page, limit);

  return res.status(200).json({
    success: true,
    ...result
  });
};

/**
 * Retrieves forensic details for a specific lookalike candidate alert.
 * Reads from cache first.
 */
export const getLookalikeAlertById = async (req, res) => {
  const { id } = req.params;

  // Try cache first (non-UUID alert IDs like 'alert_01' are valid cache keys)
  const cached = lookalikeCache.get(id);
  if (cached) {
    return res.status(200).json({
      success: true,
      data: cached
    });
  }

  // Validate UUID format for DB lookup
  if (!id || !UUID_REGEX.test(id)) {
    return res.status(404).json({
      success: false,
      status: 404,
      error: 'Not Found',
      message: 'The requested alert identifier is invalid or does not exist.'
    });
  }

  // Search through all cache values by UUID
  for (const alert of lookalikeCache.values()) {
    if (alert.id === id) {
      return res.status(200).json({ success: true, data: alert });
    }
  }

  return res.status(404).json({
    success: false,
    status: 404,
    error: 'Not Found',
    message: 'The requested lookalike candidate alert could not be found.'
  });
};

export default {
  getLookalikeAlerts,
  getLookalikeAlertById
};
