import supabase from '../client.js';
import logger from '../../utils/logger.js';
import { lookalikeCache, getCachedLookalikes, upsertLookalikeInCache } from '../cache.js';

/**
 * Fetches lookalike domain alerts. ALWAYS serves from cache (instant).
 * Cache is pre-populated with known threats and updated on every new scan.
 */
export const getLookalikeAlerts = async (filters = {}, page = 1, limit = 50) => {
  // ✅ Serve from cache — zero-latency, always available
  const allAlerts = getCachedLookalikes(500, filters);
  const offset = (page - 1) * limit;
  const paginated = allAlerts.slice(offset, offset + limit);

  return {
    data: paginated,
    pagination: {
      total: allAlerts.length,
      page,
      limit,
      totalPages: Math.max(Math.ceil(allAlerts.length / limit), 1)
    }
  };
};

/**
 * Inserts a new lookalike alert. Cache updated immediately, Supabase async.
 */
export const insertLookalikeAlert = async (alertData) => {
  const record = {
    id: alertData.id || `alert_${Date.now()}`,
    candidate_domain: alertData.candidateDomain,
    matched_brand: alertData.matchedBrand,
    similarity_score: alertData.similarityScore,
    risk_level: alertData.riskLevel || 'unknown',
    detection_type: alertData.detectionType,
    status: alertData.status || 'active',
    evidence_summary: alertData.evidenceSummary || {},
    detected_at: new Date().toISOString()
  };

  // ✅ Update cache immediately
  upsertLookalikeInCache(record);

  // 🔄 Async background write to Supabase
  supabase.from('lookalike_alerts').upsert({
    candidate_domain: alertData.candidateDomain,
    matched_brand: alertData.matchedBrand,
    similarity_score: alertData.similarityScore,
    risk_level: alertData.riskLevel || 'unknown',
    detection_type: alertData.detectionType,
    status: alertData.status || 'active',
    evidence_summary: alertData.evidenceSummary || {}
  }, { onConflict: 'candidate_domain' }).then(({ error }) => {
    if (error) {
      logger.warn(`[Cache] Background Supabase lookalike upsert failed: ${error.message}`);
    }
  }).catch(() => {});

  return record;
};

export default {
  getLookalikeAlerts,
  insertLookalikeAlert
};
