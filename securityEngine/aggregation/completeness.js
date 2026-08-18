class CompletenessCalculator {
  /**
   * Calculates analysis completeness ratio (0.0 to 1.0).
   * @param {Object} analyzersDict - Map of analyzer results
   * @param {number} totalExpectedAnalyzers 
   */
  static calculate(analyzersDict, totalExpectedAnalyzers = 8) {
    if (!analyzersDict || typeof analyzersDict !== 'object') {
      return 0.0;
    }

    const executed = Object.keys(analyzersDict);
    if (executed.length === 0) return 0.0;

    const successful = executed.filter(key => analyzersDict[key]?.success === true).length;
    return Number((successful / Math.max(totalExpectedAnalyzers, executed.length)).toFixed(2));
  }
}

module.exports = CompletenessCalculator;
