class NRDIngestion {
  /**
   * Normalizes raw incoming NRD text stream into domain lists.
   * @param {string} rawFeedContent 
   */
  static parseFeed(rawFeedContent) {
    if (!rawFeedContent || typeof rawFeedContent !== 'string') return [];

    return rawFeedContent
      .split(/\r?\n/)
      .map(line => line.trim().toLowerCase())
      .filter(line => line.length > 0 && !line.startsWith('#'));
  }
}

module.exports = NRDIngestion;
