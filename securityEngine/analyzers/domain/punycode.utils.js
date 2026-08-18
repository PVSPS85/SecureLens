const punycode = require('punycode/');

class PunycodeUtils {
  /**
   * Checks if a domain uses Punycode (starts with xn--).
   * @param {string} domain 
   * @returns {boolean}
   */
  static isPunycode(domain) {
    if (!domain) return false;
    return domain.split('.').some(part => part.toLowerCase().startsWith('xn--'));
  }

  /**
   * Converts Punycode domain to Unicode ASCII/UTF-8 representation.
   * @param {string} domain 
   * @returns {string} Decoded domain
   */
  static decodeDomain(domain) {
    if (!domain) return '';
    try {
      return punycode.toUnicode(domain);
    } catch {
      return domain;
    }
  }
}

module.exports = PunycodeUtils;
