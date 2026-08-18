import { getScanById } from '../db/queries/scans.queries.js';
import { getReportByScanId } from '../db/queries/reports.queries.js';
import { generateInvestigationSummary, handleChatQuery } from '../services/secureAi.service.js';

// Matches standard RFC 4122 UUID v4 formatting syntax
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[45][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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

    res.status(200).json({
      success: true,
      data: aiResult
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
      data: aiResponse
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
