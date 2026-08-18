const punycode = require('punycode/');

class NRDNormalizer {
  /**
   * Normalizes a raw domain string from an NRD feed into a clean lowercase FQDN.
   * @param {string} rawDomain 
   * @returns {string|null} Normalized domain or null if invalid
   */
  static normalize(rawDomain) {
    if (!rawDomain || typeof rawDomain !== 'string') return null;

    let domain = rawDomain.trim().toLowerCase();

    // Strip scheme if present
    domain = domain.replace(/^[a-z]+:\/\//i, '');

    // Strip path, query params, and port numbers
    domain = domain.split('/')[0].split('?')[0].split('#')[0].split(':')[0];

    // Remove trailing dot if present
    if (domain.endsWith('.')) {
      domain = domain.slice(0, -1);
    }

    // Convert internationalized domain names (IDN) to punycode
    try {
      domain = punycode.toASCII(domain);
    } catch {
      return null;
    }

    // Validate standard domain format
    const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-2]{2,}$/i;
    return domainRegex.test(domain) ? domain : null;
  }
}

module.exports = NRDNormalizer;
