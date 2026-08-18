import { validateQr, validateEmail, validatePhone } from '../validators/scanner.validator.js';
import { analyzeEmailSecurity, analyzePhoneReputation } from '../services/securityEngine.interface.js';

/**
 * Controller handlers for specialized scanner endpoints (QR, Email, Phone).
 */

/**
 * Decodes and inspects QR code string payloads.
 * Routes URL redirections safely.
 */
export const scanQrPayload = async (req, res, next) => {
  const { payload } = req.body;

  try {
    const validation = validateQr(payload);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        status: 400,
        error: 'Bad Request',
        message: validation.error
      });
    }

    const inputString = validation.sanitized;
    
    // Check if the payload matches standard URL patterns (starts with http/https)
    const hasUrl = /^https?:\/\/[^\s]+$/i.test(inputString);

    if (hasUrl) {
      return res.status(200).json({
        success: true,
        type: 'url',
        payload: inputString,
        hasUrl: true,
        scanRecommendation: 'The QR payload contains a redirect URL. Running a full URL scanner check is recommended.',
        redirectUrl: inputString
      });
    }

    res.status(200).json({
      success: true,
      type: 'text',
      payload: inputString,
      hasUrl: false,
      scanRecommendation: 'Plain text payload detected. No redirect risks identified.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Validates email domains and retrieves mock authentication security controls.
 */
export const scanEmailDomain = async (req, res, next) => {
  const { email } = req.body;

  try {
    const validation = validateEmail(email);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        status: 400,
        error: 'Bad Request',
        message: validation.error
      });
    }

    const { domain } = validation;
    const result = await analyzeEmailSecurity(domain);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Validates international numbers and analyzes reputation metrics.
 * STRICT PRIVACY CONSTRAINT: Never exposes identity metadata or personal names.
 */
export const scanPhoneReputation = async (req, res, next) => {
  const { phoneNumber } = req.body;

  try {
    const validation = validatePhone(phoneNumber);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        status: 400,
        error: 'Bad Request',
        message: validation.error
      });
    }

    const sanitizedNumber = validation.sanitized;
    const result = await analyzePhoneReputation(sanitizedNumber);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export default {
  scanQrPayload,
  scanEmailDomain,
  scanPhoneReputation
};
