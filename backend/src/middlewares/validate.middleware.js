import { validateAndClassifyTarget } from '../validators/scan.validator.js';

/**
 * Express middleware to validate, sanitize, and classify incoming scan targets.
 * Intercepts request payload and responds with 400 Bad Request on validation errors.
 */
export const validateScanRequest = (req, res, next) => {
  const { target } = req.body;

  if (target === undefined) {
    return res.status(400).json({
      success: false,
      status: 400,
      error: 'Bad Request',
      message: 'Required body parameter "target" is missing.'
    });
  }

  const validation = validateAndClassifyTarget(target);

  if (!validation.isValid) {
    return res.status(400).json({
      success: false,
      status: 400,
      error: 'Bad Request',
      message: validation.error
    });
  }

  // Inject normalized target properties into the request context
  req.validatedTarget = {
    target: validation.normalized,
    type: validation.type,
    details: validation.details || null
  };

  next();
};

export default {
  validateScanRequest
};
