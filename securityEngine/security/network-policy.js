class NetworkPolicy {
  static RESTRICTED_PORTS = [21, 22, 23, 25, 3389, 6379, 27017];
  
  /**
   * Validates if an outbound URL/port adheres to network security policies.
   * @param {string} urlString 
   */
  static isAllowedUrl(urlString) {
    try {
      const parsed = new URL(urlString);

      // Only HTTP and HTTPS protocols allowed
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        return { allowed: false, reason: `Disallowed protocol: ${parsed.protocol}` };
      }

      // Check port constraints
      const port = parsed.port ? parseInt(parsed.port, 10) : (parsed.protocol === 'https:' ? 443 : 80);
      if (this.RESTRICTED_PORTS.includes(port)) {
        return { allowed: false, reason: `Access to restricted port ${port} blocked` };
      }

      return { allowed: true };
    } catch (e) {
      return { allowed: false, reason: `Invalid URL format: ${e.message}` };
    }
  }
}

module.exports = NetworkPolicy;
