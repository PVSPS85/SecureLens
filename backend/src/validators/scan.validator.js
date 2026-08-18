import net from 'net';
import { isBlockedTarget } from '../utils/ssrfGuard.js';
import { normalizeTarget } from '../utils/normalizer.js';

// Matches standard domains like google.com, sub.domain.co.uk
const DOMAIN_REGEX = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i;

// Matches brand search expressions (2-100 alphanumeric chars, spaces, and safe signs)
const BRAND_REGEX = /^[a-zA-Z0-9\s&'.-]{2,100}$/;

/**
 * Validates, normalizes, and classifies a target string into one of: 'url', 'domain', 'ip', or 'brand_search'.
 * Applies SSRF filters and checks syntax constraints.
 *
 * @param {string} target - The raw user input.
 * @returns {object} { isValid: boolean, type?: string, normalized?: string, error?: string, details?: object }
 */
export const validateAndClassifyTarget = (target) => {
  if (target === undefined || target === null) {
    return { isValid: false, error: 'Target identifier is required.' };
  }

  if (typeof target !== 'string') {
    return { isValid: false, error: 'Target identifier must be a text string.' };
  }

  const trimmed = target.trim();
  if (trimmed.length === 0) {
    return { isValid: false, error: 'Target identifier cannot be empty.' };
  }

  if (trimmed.length > 2048) {
    return { isValid: false, error: 'Target identifier length cannot exceed 2048 characters.' };
  }

  if (isBlockedTarget(trimmed)) {
    return { isValid: false, error: 'Target identifier resolves to a restricted private or local loopback address.' };
  }

  // 1. Check IP address classification
  if (net.isIP(trimmed)) {
    if (isBlockedTarget(trimmed)) {
      return { isValid: false, error: 'Target IP points to a restricted private or local loopback address.' };
    }
    return { 
      isValid: true, 
      type: 'ip', 
      normalized: trimmed.toLowerCase() 
    };
  }

  // 2. Check URL classification (detect scheme presence)
  const hasScheme = /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(trimmed);
  if (hasScheme) {
    try {
      const normalized = normalizeTarget(trimmed);
      
      // Enforce SSRF restrictions on parsed hostname
      if (isBlockedTarget(normalized.hostname)) {
        return { isValid: false, error: 'Target URL resolves to a restricted private or local loopback address.' };
      }
      
      // Enforce protocol boundaries (HTTP/HTTPS only)
      if (normalized.scheme !== 'http' && normalized.scheme !== 'https') {
        return { isValid: false, error: 'Unsupported URL protocol. Only HTTP and HTTPS routes are supported.' };
      }

      return { 
        isValid: true, 
        type: 'url', 
        normalized: normalized.normalizedUrl,
        details: normalized 
      };
    } catch (e) {
      return { isValid: false, error: 'Target URL is malformed or invalid.' };
    }
  }

  // 3. Check Domain classification
  if (DOMAIN_REGEX.test(trimmed)) {
    if (isBlockedTarget(trimmed)) {
      return { isValid: false, error: 'Target domain refers to a restricted private or local loopback address.' };
    }
    try {
      const normalized = normalizeTarget(trimmed);
      return { 
        isValid: true, 
        type: 'domain', 
        normalized: normalized.hostname,
        details: normalized 
      };
    } catch (e) {
      return { isValid: false, error: 'Target domain hostname is malformed.' };
    }
  }

  // 4. Check Brand Search classification
  if (BRAND_REGEX.test(trimmed)) {
    return { 
      isValid: true, 
      type: 'brand_search', 
      normalized: trimmed 
    };
  }

  return { 
    isValid: false, 
    error: 'Target identifier does not match any valid format (URL, Domain, IP, or Brand Name).' 
  };
};

export default {
  validateAndClassifyTarget
};
