/**
 * ============================================================================
 * SECUREAI ENDPOINT INTEGRATION REFERENCE GUIDE
 * ============================================================================
 * 
 * 1. GET AI Summary Endpoint:
 *    - Route: GET /api/v1/secure-ai/summary/:scanId
 *    - Params: scanId (string, UUID v4 format matches UUID_REGEX)
 *    - Response (200 OK):
 *      {
 *        "success": true,
 *        "cached": true | false,   // true if fetched from Memory/DB, false if fresh AI run
 *        "summary": "### SecureAI Threat Investigation Report..."  // Markdown formatted string
 *      }
 *    - Error Response (404/500):
 *      {
 *        "success": false,
 *        "status": 404 | 500,
 *        "error": "Not Found" | "Internal Server Error",
 *        "message": "Informative error string details..."
 *      }
 * 
 * 2. POST AI Chat Endpoint:
 *    - Route: POST /api/v1/secure-ai/chat
 *    - Body Schema:
 *      {
 *        "scanId": "bc567081-597a-4a9c-a360-c33069ed35d6",  // String, UUID v4
 *        "message": "Why did this scan get a Low rating?"    // String, non-empty
 *      }
 *    - Response (200 OK):
 *      {
 *        "success": true,
 *        "response": "Based on the scan findings..."  // Chat response string
 *      }
 *    - Error Response (400/404/500):
 *      {
 *        "success": false,
 *        "status": 400 | 404 | 500,
 *        "error": "Bad Request" | "Not Found" | "Internal Server Error",
 *        "message": "Informative error details..."
 *      }
 * ============================================================================
 */

import { getScanById } from '../db/queries/scans.queries.js';
import { getReportByScanId, updateReportSummary } from '../db/queries/reports.queries.js';
import { generateInvestigationSummary, handleChatQuery } from '../services/secureAi.service.js';

// Matches standard RFC 4122 UUID v4 formatting syntax
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[45][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// Local in-memory cache for ultra-fast, sub-2ms retrievals
const summaryCache = new Map();

/**
 * Endpoint retrieving the AI-generated plain language summary for a scan.
 */
export const getAiSummary = async (req, res, next) => {
  const { scanId } = req.params;

  try {
    // Validate UUID format parameters
    if (!scanId || !UUID_REGEX.test(scanId)) {
      return res.status(404).json({
        success: false,
        status: 404,
        error: 'Not Found',
        message: 'The requested scan identifier is invalid or does not exist.'
      });
    }

    // 1. Memory Cache check (Ultra-fast, < 2ms)
    if (summaryCache.has(scanId)) {
      return res.status(200).json({
        success: true,
        cached: true,
        summary: summaryCache.get(scanId)
      });
    }

    // 2. Database Cache check (Network roundtrip, ~150-400ms)
    const report = await getReportByScanId(scanId);

    if (report && report.summary && report.summary.trim().length > 0) {
      // Populate memory cache for future requests
      summaryCache.set(scanId, report.summary);
      return res.status(200).json({
        success: true,
        cached: true,
        summary: report.summary
      });
    }

    // If report doesn't exist or summary is empty, fetch the scan details
    const scan = await getScanById(scanId);

    if (!scan) {
      return res.status(404).json({
        success: false,
        status: 404,
        error: 'Not Found',
        message: 'The requested scan execution could not be found.'
      });
    }

    // Compile values into payload formats expected by service
    const evidencePayload = {
      scanId: scan.id,
      target: scan.target,
      findings: report ? report.findings : []
    };

    const riskResult = {
      score: scan.risk_score,
      riskLevel: scan.risk_level,
      confidence: 0.95, // mock estimation constants
      completeness: 0.90,
      recommendation: report ? report.recommendation : '',
      rulebookVersion: report ? report.rulebook_version : '1.0'
    };

    const aiResult = await generateInvestigationSummary(evidencePayload, riskResult);

    // Save generated summary to database
    await updateReportSummary(scanId, aiResult.summary);

    // Populate memory cache for future requests
    summaryCache.set(scanId, aiResult.summary);

    res.status(200).json({
      success: true,
      cached: false,
      summary: aiResult.summary
    });
  } catch (error) {
    // Graceful error fallbacks returning structured informative error payload
    res.status(500).json({
      success: false,
      status: 500,
      error: 'Internal Server Error',
      message: 'SecureAI failed to generate investigation summary. Please try again later.'
    });
  }
};

/**
 * Endpoint accepting user questions and returning chatbot advisor query answers.
 */
export const postAiChat = async (req, res, next) => {
  const { scanId, message } = req.body;

  try {
    // Validate scan ID UUID format
    if (!scanId || !UUID_REGEX.test(scanId)) {
      return res.status(404).json({
        success: false,
        status: 404,
        error: 'Not Found',
        message: 'The requested scan identifier is invalid or does not exist.'
      });
    }

    // Validate chat message parameters
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        status: 400,
        error: 'Bad Request',
        message: 'A non-empty user chat message string parameter is required.'
      });
    }

    const scan = await getScanById(scanId);

    if (!scan) {
      return res.status(404).json({
        success: false,
        status: 404,
        error: 'Not Found',
        message: 'The requested scan execution could not be found.'
      });
    }

    const report = await getReportByScanId(scanId);

    const evidenceContext = {
      scan,
      report
    };

    const aiResponse = await handleChatQuery(scanId, message, evidenceContext);

    res.status(200).json({
      success: true,
      response: aiResponse.response
    });
  } catch (error) {
    // Graceful error fallbacks returning structured informative error payload
    res.status(500).json({
      success: false,
      status: 500,
      error: 'Internal Server Error',
      message: 'SecureAI failed to handle the chat query. Please try again later.'
    });
  }
};

export default {
  getAiSummary,
  postAiChat
};
