
const net = require('net');
const dns = require('dns').promises;

// Private and loopback IP ranges
const PRIVATE_IP_RANGES = [
  /^127\./,                 // Loopback
  /^10\./,                  // Private Class A
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // Private Class B
  /^192\.168\./,            // Private Class C
  /^169\.254\./,            // Link-local / Cloud Metadata
  /^0\./,                   // Current network
  /^::1$/,                  // IPv6 Loopback
  /^fe80:/i,                // IPv6 Link-local
  /^fc00:/i,                // IPv6 Unique Local
];

class SSRFGuard {
  /**
   * Checks if an IP address is private/restricted.
   * @param {string} ip
   * @returns {boolean}
   */
  static isPrivateIP(ip) {
    if (!net.isIP(ip)) return false;
    return PRIVATE_IP_RANGES.some((regex) => regex.test(ip));
  }

  /**
   * Validates a hostname or IP before making outbound network requests.
   * @param {string} hostname
   * @throws {Error} If destination resolves to a restricted IP address.
   */
  static async validateDestination(hostname) {
    // Direct IP check
    if (net.isIP(hostname)) {
      if (this.isPrivateIP(hostname)) {
        throw new Error(`SSRF Blocked: ${hostname} resolves to a restricted IP.`);
      }
      return hostname;
    }

    // Resolve domain to IP and validate
    try {
      const addresses = await dns.resolve(hostname);
      for (const ip of addresses) {
        if (this.isPrivateIP(ip)) {
          throw new Error(`SSRF Blocked: Domain ${hostname} resolved to restricted IP ${ip}.`);
        }
      }
      return addresses[0];
    } catch (err) {
      if (err.message.startsWith('SSRF Blocked')) throw err;
      throw new Error(`DNS resolution failed for SSRF validation: ${err.message}`);
    }
  }
}

module.exports = SSRFGuard;
