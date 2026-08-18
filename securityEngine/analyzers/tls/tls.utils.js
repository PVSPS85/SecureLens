class TLSUtils {
  /**
   * Calculates days remaining before certificate expiration.
   * @param {string|Date} validToDate 
   */
  static calculateDaysToExpiration(validToDate) {
    if (!validToDate) return null;
    const expiry = new Date(validToDate);
    if (isNaN(expiry.getTime())) return null;

    const now = new Date();
    const diffMs = expiry.getTime() - now.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  }
}

module.exports = TLSUtils;
