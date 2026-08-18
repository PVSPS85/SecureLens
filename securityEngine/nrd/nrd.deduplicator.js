class NRDDeduplicator {
  constructor() {
    this.seenDomains = new Set();
  }

  /**
   * Filters out already processed domains from batch array.
   * @param {Array<string>} domains 
   * @returns {Array<string>} Unseen domains
   */
  filterDuplicates(domains) {
    const unique = [];
    for (const domain of domains) {
      if (!this.seenDomains.has(domain)) {
        this.seenDomains.add(domain);
        unique.push(domain);
      }
    }
    return unique;
  }

  clearCache() {
    this.seenDomains.clear();
  }
}

module.exports = NRDDeduplicator;
