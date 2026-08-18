const EvidenceContract = require('../contracts/evidence.contract');

class EvidenceAggregator {
  /**
   * Compiles individual analyzer outputs into a unified EvidenceContract.
   * @param {Object} targetContext - Target specification
   * @param {Array<Object>} analyzerResults - Array of formatResult outputs
   */
  static aggregate(targetContext, analyzerResults) {
    const evidencePayload = new EvidenceContract({
      target: targetContext.value,
      targetType: targetContext.type
    });

    for (const result of analyzerResults) {
      if (result && result.analyzer) {
        evidencePayload.addAnalyzerResult(result.analyzer, result);
      }
    }

    return evidencePayload;
  }
}

module.exports = EvidenceAggregator;
