import { randomUUID } from 'crypto';
import supabase from '../client.js';
import logger from '../../utils/logger.js';
import { scanCache } from '../cache.js';

/**
 * Inserts a new scan record. Cache is updated IMMEDIATELY for instant reads.
 * Supabase write happens asynchronously in the background.
 */
export const insertScan = async (scanData) => {
  const id = randomUUID();
  const record = {
    id,
    user_id: scanData.userId || null,
    target: scanData.target,
    normalized_target: scanData.normalizedTarget,
    target_type: scanData.targetType,
    source: scanData.source,
    status: scanData.status || 'queued',
    risk_level: scanData.riskLevel || 'unknown',
    risk_score: scanData.riskScore || 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  // ✅ Cache immediately — zero-latency
  scanCache.set(id, record);

  // 🔄 Async background write to Supabase (non-blocking)
  supabase.from('scans').insert({
    user_id: record.user_id,
    target: record.target,
    normalized_target: record.normalized_target,
    target_type: record.target_type,
    source: record.source,
    status: record.status,
    risk_level: record.risk_level,
    risk_score: record.risk_score
  }).then(({ error }) => {
    if (error) {
      logger.warn(`[Cache] Background Supabase insert failed for ${id}: ${error.message}`);
    }
  }).catch(() => {});

  return record;
};

/**
 * Updates scan status. Cache updated immediately, Supabase async.
 */
export const updateScanStatus = async (scanId, status, riskScore, riskLevel) => {
  const existing = scanCache.get(scanId) || { id: scanId };
  const updated = {
    ...existing,
    status,
    risk_score: riskScore,
    risk_level: riskLevel,
    updated_at: new Date().toISOString()
  };

  // ✅ Update cache immediately
  scanCache.set(scanId, updated);

  // 🔄 Async background write to Supabase
  supabase.from('scans').update({
    status,
    risk_score: riskScore,
    risk_level: riskLevel,
    updated_at: updated.updated_at
  }).eq('id', scanId).then(({ error }) => {
    if (error) {
      logger.warn(`[Cache] Background Supabase update failed for ${scanId}: ${error.message}`);
    }
  }).catch(() => {});

  return updated;
};

/**
 * Fetches a scan by ID. Reads from cache first (instant).
 */
export const getScanById = async (scanId) => {
  // ✅ Try cache first — zero-latency
  const cached = scanCache.get(scanId);
  if (cached) return cached;

  // 🔄 Fall back to Supabase only if not in cache (e.g. after server restart)
  try {
    const { data, error } = await supabase
      .from('scans')
      .select('*')
      .eq('id', scanId)
      .maybeSingle();

    if (!error && data) {
      scanCache.set(scanId, data); // warm the cache
      return data;
    }
  } catch (err) {
    logger.warn(`[Cache] Supabase getScanById failed: ${err.message}`);
  }

  return null;
};

/**
 * Returns paginated user scan history. Reads from cache (instant).
 */
export const getUserScanHistory = async (userId, options = {}) => {
  const page = parseInt(options.page, 10) || 1;
  const limit = parseInt(options.limit, 10) || 10;
  const offset = (page - 1) * limit;

  const allScans = Array.from(scanCache.values());
  allScans.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const paginated = allScans.slice(offset, offset + limit);

  return {
    data: paginated,
    pagination: {
      total: allScans.length,
      page,
      limit,
      totalPages: Math.max(Math.ceil(allScans.length / limit), 1)
    }
  };
};

export default {
  insertScan,
  updateScanStatus,
  getScanById,
  getUserScanHistory
};
