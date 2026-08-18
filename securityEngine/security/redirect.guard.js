const SSRFGuard = require('./ssrf.guard');

class RedirectGuard {
  constructor(maxHops = 5) {
    this.maxHops = maxHops;
  }

  /**
   * Validates a redirect target URL before following it.
   * @param {string} targetUrl 
   * @param {number} currentHopCount 
   */
  async validateRedirect(targetUrl, currentHopCount) {
    if (currentHopCount >= this.maxHops) {
      throw new Error(`Redirect blocked: Exceeded maximum allowed hops (${this.maxHops})`);
    }

    const parsed = new URL(targetUrl);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new Error(`Redirect blocked: Disallowed protocol '${parsed.protocol}'`);
    }

    await SSRFGuard.validateDestination(parsed.hostname);
    return true;
  }
}

module.exports = RedirectGuard;
