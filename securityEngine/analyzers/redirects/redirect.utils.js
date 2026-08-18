class RedirectUtils {
  /**
   * Analyzes an array of HTTP redirect steps.
   * @param {Array<string>} redirectChain 
   */
  static analyzeChain(redirectChain = []) {
    if (!Array.isArray(redirectChain) || redirectChain.length <= 1) {
      return { hopCount: 0, hasCrossDomainHop: false, finalDestination: redirectChain[0] || null };
    }

    const domains = redirectChain.map(url => {
      try { return new URL(url).hostname; } catch { return url; }
    });

    const initialDomain = domains[0];
    const finalDestination = redirectChain[redirectChain.length - 1];
    const hasCrossDomainHop = domains.some(d => d !== initialDomain);

    return {
      hopCount: redirectChain.length - 1,
      hasCrossDomainHop,
      initialDomain,
      finalDomain: domains[domains.length - 1],
      finalDestination
    };
  }
}

module.exports = RedirectUtils;
