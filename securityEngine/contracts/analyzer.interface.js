/**
 * Interface/Base class for all SecureLens Analyzers.
 * Analyzers MUST only report facts/evidence and NEVER assign risk scores directly.
 */
class BaseAnalyzer {
  constructor(name) {
    if (new.target === BaseAnalyzer) {
      throw new TypeError("Cannot instantiate BaseAnalyzer directly.");
    }
    this.name = name;
  }

  /**
   * Executes the analysis on a target.
   * @param {Object} context - Target details (domain, url, ip, targetType).
   * @returns {Promise<Object>} Evidence payload containing facts.
   */
  async analyze(context) {
    throw new Error(`Method 'analyze()' must be implemented in ${this.name}`);
  }

  /**
   * Helper to format standardized evidence output.
   * @param {boolean} success - Whether the analysis succeeded.
   * @param {Object} data - Extracted facts/evidence.
   * @param {Error|string|null} error - Error message if failed.
   */
  formatResult(success, data = {}, error = null) {
    return {
      analyzer: this.name,
      timestamp: new Date().toISOString(),
      success,
      data,
      error: error ? (error.message || String(error)) : null
    };
  }
}

module.exports = BaseAnalyzer;
