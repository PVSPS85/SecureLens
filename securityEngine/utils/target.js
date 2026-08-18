const net = require('net');

class TargetUtils {
  /**
   * Determines target type and returns clean normalized target.
   * @param {string} input 
   */
  static parseTarget(input) {
    if (!input || typeof input !== 'string') {
      throw new Error('Target must be a non-empty string');
    }

    const trimmed = input.trim();

    // Check if valid IP
    if (net.isIP(trimmed)) {
      return { type: 'ip', value: trimmed, raw: input };
    }

    // Check if full URL
    if (/^https?:\/\//i.test(trimmed)) {
      try {
        const parsedUrl = new URL(trimmed);
        return {
          type: 'url',
          value: parsedUrl.href,
          hostname: parsedUrl.hostname,
          protocol: parsedUrl.protocol,
          raw: input
        };
      } catch {
        throw new Error('Invalid URL format');
      }
    }

    // Assume Domain
    const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i;
    if (domainRegex.test(trimmed)) {
      return { type: 'domain', value: trimmed.toLowerCase(), raw: input };
    }

    throw new Error(`Unable to determine target type for: ${input}`);
  }
}

module.exports = TargetUtils;
