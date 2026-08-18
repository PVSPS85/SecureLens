/**
 * Input validators and format sanitizers for the specialized scanners (QR, Email, Phone).
 */

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

// Matches standard E.164 international phone number format: starts with +, followed by 2 to 15 digits
const PHONE_REGEX = /^\+[1-9]\d{1,14}$/;

/**
 * Validates decoded QR payload.
 *
 * @param {string} payload - Decoded QR string.
 * @returns {object} { isValid, sanitized, error }
 */
export const validateQr = (payload) => {
  if (payload === undefined || payload === null) {
    return { isValid: false, error: 'QR code payload is required.' };
  }
  if (typeof payload !== 'string') {
    return { isValid: false, error: 'QR code payload must be a text string.' };
  }
  const sanitized = payload.trim();
  if (sanitized.length === 0) {
    return { isValid: false, error: 'QR code payload cannot be empty.' };
  }
  if (sanitized.length > 4096) {
    return { isValid: false, error: 'QR payload exceeds maximum length of 4096 characters.' };
  }
  return { isValid: true, sanitized };
};

/**
 * Validates email address format and extracts the target domain.
 *
 * @param {string} email - Email address input.
 * @returns {object} { isValid, sanitized, domain, error }
 */
export const validateEmail = (email) => {
  if (email === undefined || email === null) {
    return { isValid: false, error: 'Email address parameter is required.' };
  }
  if (typeof email !== 'string') {
    return { isValid: false, error: 'Email address must be a text string.' };
  }
  const sanitized = email.trim();
  if (!EMAIL_REGEX.test(sanitized)) {
    return { isValid: false, error: 'Malformed email address format.' };
  }

  // Extract domain name safely
  const parts = sanitized.split('@');
  const domain = parts[parts.length - 1].toLowerCase();

  return { 
    isValid: true, 
    sanitized, 
    domain 
  };
};

/**
 * Validates international E.164 phone number formatting syntax.
 *
 * @param {string} phoneNumber - Phone number input.
 * @returns {object} { isValid, sanitized, error }
 */
export const validatePhone = (phoneNumber) => {
  if (phoneNumber === undefined || phoneNumber === null) {
    return { isValid: false, error: 'Phone number parameter is required.' };
  }
  if (typeof phoneNumber !== 'string') {
    return { isValid: false, error: 'Phone number must be a text string.' };
  }
  
  // Strip all whitespaces and dashes for uniform validation checks
  const sanitized = phoneNumber.trim().replace(/[\s-()]+/g, '');

  if (!PHONE_REGEX.test(sanitized)) {
    return { isValid: false, error: 'Phone number must conform to E.164 international format (e.g. +14155552671).' };
  }

  return { isValid: true, sanitized };
};

export default {
  validateQr,
  validateEmail,
  validatePhone
};
