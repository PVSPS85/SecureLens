class ConfidenceCalculator {
  /**
   * Computes evidence confidence metric (0.0 to 1.0) based on signal quality.
   * @param {Object} analyzersDict 
   */
  static calculate(analyzersDict) {
    let weightedScore = 0;
    let maxPossible = 0;

    const weights = {
      dns: 0.3,
      whois: 0.3,
      tls: 0.2,
      http: 0.2
    };

    for (const [key, weight] of Object.entries(weights)) {
      maxPossible += weight;
      if (analyzersDict[key] && analyzersDict[key].success) {
        weightedScore += weight;
      }
    }

    return Number((weightedScore / maxPossible).toFixed(2));
  }
}

module.exports = ConfidenceCalculator;
