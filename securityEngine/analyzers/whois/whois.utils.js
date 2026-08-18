class WhoisUtils {
  /**
   * Computes age in days from domain creation timestamp.
   * @param {string|Date} creationDate 
   */
  static calculateDomainAgeDays(creationDate) {
    if (!creationDate) return null;
    const created = new Date(creationDate);
    if (isNaN(created.getTime())) return null;

    const diffMs = Date.now() - created.getTime();
    if (diffMs < 0) return 0;

    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  }
}

module.exports = WhoisUtils;
