const dns = require('dns').promises;
const SSRFGuard = require('./ssrf.guard');

class DNSRebindingGuard {
  /**
   * Resolves domain and verifies IP safety directly prior to execution.
   * @param {string} domain 
   * @returns {Promise<string>} Validated IP address
   */
  static async verifyAndResolve(domain) {
    const addresses = await dns.resolve4(domain);
    if (!addresses || addresses.length === 0) {
      throw new Error(`DNS Rebinding Check Failed: No IPv4 records for ${domain}`);
    }

    for (const ip of addresses) {
      if (SSRFGuard.isPrivateIP(ip)) {
        throw new Error(`DNS Rebinding Blocked: ${domain} resolved to non-public IP ${ip}`);
      }
    }

    return addresses[0];
  }
}

module.exports = DNSRebindingGuard;
