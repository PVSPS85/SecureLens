import { getHistory } from '../services/database.interface.js';

/**
 * Controller to fetch scan history records for the frontend dashboard.
 * Supports filters and pagination, with a capped maximum limit of 50.
 */
export const getScanHistory = async (req, res, next) => {
  try {
    let page = parseInt(req.query.page, 10) || 1;
    let limit = parseInt(req.query.limit, 10) || 10;
    const { risk } = req.query;

    // Sanitize parameters
    if (page <= 0) page = 1;
    if (limit <= 0) limit = 10;
    if (limit > 50) limit = 50; // Protect against resource exhaustion

    const filters = {};
    if (risk) {
      filters.risk = risk;
    }

    const result = await getHistory(filters, page, limit, req.user.id);

    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    // Forward database / server errors to global error middleware
    next(error);
  }
};

export default {
  getScanHistory
};
