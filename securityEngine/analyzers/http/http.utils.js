class HTTPUtils {
  /**
   * Checks presence of standard HTTP security headers.
   * @param {Object} headers 
   */
  static evaluateSecurityHeaders(headers = {}) {
    const normalized = {};
    for (const key of Object.keys(headers)) {
      normalized[key.toLowerCase()] = headers[key];
    }

    return {
      hasStrictTransportSecurity: Boolean(normalized['strict-transport-security']),
      hasContentSecurityPolicy: Boolean(normalized['content-security-policy']),
      hasXContentTypeOptions: Boolean(normalized['x-content-type-options']),
      hasXFrameOptions: Boolean(normalized['x-frame-options']),
      serverHeader: normalized['server'] || null
    };
  }
}

module.exports = HTTPUtils;
