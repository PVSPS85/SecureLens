class EvidenceContract {
  /**
   * Constructs a standardized evidence payload.
   * @param {Object} params
   * @param {string} params.target - Domain, IP, or URL being analyzed
   * @param {string} params.targetType - 'domain' | 'ip' | 'url'
   * @param {Object} [params.analyzers] - Map of analyzer results
   */
  constructor({ target, targetType, analyzers = {} }) {
    this.target = target;
    this.targetType = targetType;
    this.timestamp = new Date().toISOString();
    this.analyzers = analyzers;
  }

  /**
   * Attaches or updates an analyzer's result.
   * @param {string} name - Analyzer key (e.g., 'dns', 'whois')
   * @param {Object} result - Result formatted via BaseAnalyzer.formatResult
   */
  addAnalyzerResult(name, result) {
    this.analyzers[name] = result;
  }

  toJSON() {
    return {
      target: this.target,
      targetType: this.targetType,
      timestamp: this.timestamp,
      analyzers: this.analyzers
    };
  }
}

module.exports = EvidenceContract;
