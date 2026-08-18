import { getUserScanHistory } from '../db/queries/scans.queries.js';

/**
 * Controller to fetch scan history records for the frontend dashboard.
 * Queries live scan history from Supabase with limit and risk filters.
 */
export const getScanHistory = async (req, res, next) => {
  try {
    let page = parseInt(req.query.page, 10) || 1;
    let limit = parseInt(req.query.limit, 10) || 10;
    const { risk } = req.query;

    // Sanitize parameters to prevent denial-of-service via massive requests
    if (page <= 0) page = 1;
    if (limit <= 0) limit = 10;
    if (limit > 50) limit = 50; // Protect against resource exhaustion

    const options = { page, limit };
    if (risk) {
      options.risk = risk;
    }

    // STRICT USER ISOLATION SCOPING: Passes authenticated user ID context
    const result = await getUserScanHistory(req.user.id, options);

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
