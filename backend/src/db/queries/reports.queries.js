import supabase from '../client.js';
import logger from '../../utils/logger.js';
import { reportCache } from '../cache.js';

/**
 * Inserts or updates the final scan report.
 * Cache is updated IMMEDIATELY. Supabase write happens async in background.
 */
export const insertReport = async (reportData) => {
  const record = {
    scan_id: reportData.scanId,
    summary: reportData.summary,
    findings: reportData.findings || [],
    infrastructure: reportData.infrastructure || {},
    recommendation: reportData.recommendation,
    timeline: reportData.timeline || [],
    rulebook_version: reportData.rulebookVersion || '1.0.0',
    created_at: new Date().toISOString()
  };

  // ✅ Cache immediately — zero-latency
  reportCache.set(reportData.scanId, record);

  // 🔄 Async background write to Supabase (non-blocking)
  supabase.from('reports').upsert({
    scan_id: reportData.scanId,
    summary: reportData.summary,
    findings: reportData.findings || [],
    infrastructure: reportData.infrastructure || {},
    recommendation: reportData.recommendation,
    timeline: reportData.timeline || [],
    rulebook_version: reportData.rulebookVersion || '1.0.0'
  }, { onConflict: 'scan_id' }).then(({ error }) => {
    if (error) {
      logger.warn(`[Cache] Background Supabase report upsert failed: ${error.message}`);
    }
  }).catch(() => {});

  return record;
};

/**
 * Fetches a report by scan ID. Cache-first (instant), falls back to Supabase.
 */
export const getReportByScanId = async (scanId) => {
  // ✅ Try cache first — zero-latency
  const cached = reportCache.get(scanId);
  if (cached) return cached;

  // 🔄 Fall back to Supabase only if not in cache
  try {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('scan_id', scanId)
      .maybeSingle();

    if (!error && data) {
      reportCache.set(scanId, data); // warm the cache
      return data;
    }
  } catch (err) {
    logger.warn(`[Cache] Supabase getReportByScanId failed: ${err.message}`);
  }

  return null;
};

/**
 * Updates the summary field of a report.
 */
export const updateReportSummary = async (scanId, summaryText) => {
  const existing = reportCache.get(scanId) || { scan_id: scanId };
  const updated = { ...existing, summary: summaryText };
  reportCache.set(scanId, updated);

  // 🔄 Async background write
  supabase.from('reports').upsert({
    scan_id: scanId,
    summary: summaryText
  }, { onConflict: 'scan_id' }).catch(() => {});

  return updated;
};

export default {
  insertReport,
  getReportByScanId,
  updateReportSummary
};
