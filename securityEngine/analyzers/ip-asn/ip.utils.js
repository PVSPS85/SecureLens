class IPUtils {
  /**
   * Identifies IP type and known metadata flags.
   * @param {string} ip 
   */
  static classifyIP(ip) {
    if (!ip || typeof ip !== 'string') return { isValid: false };

    const isIPv4 = /^(\d{1,3}\.){3}\d{1,3}$/.test(ip);
    const isIPv6 = ip.includes(':');

    return {
      isValid: isIPv4 || isIPv6,
      version: isIPv4 ? 4 : isIPv6 ? 6 : null
    };
  }
}

module.exports = IPUtils;
