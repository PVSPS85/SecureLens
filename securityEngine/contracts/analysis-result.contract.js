class AnalysisResultContract {
  /**
   * Constructs a standardized analysis result envelope.
   * @param {Object} params
   * @param {string} params.target
   * @param {string} params.targetType
   * @param {number} params.completeness
   * @param {number} params.confidence
   * @param {Object} params.assessment
   * @param {Object} params.evidence
   */
  constructor({ target, targetType, completeness, confidence, assessment, evidence }) {
    this.target = target;
    this.targetType = targetType;
    this.timestamp = new Date().toISOString();
    this.completeness = completeness;
    this.confidence = confidence;
    this.assessment = {
      riskScore: assessment?.riskScore ?? 0,
      riskLevel: assessment?.riskLevel ?? 'LOW',
      detectedRisks: assessment?.detectedRisks ?? []
    };
    this.evidence = evidence ?? {};
  }

  toJSON() {
    return {
      target: this.target,
      targetType: this.targetType,
      timestamp: this.timestamp,
      completeness: this.completeness,
      confidence: this.confidence,
      assessment: this.assessment,
      evidence: this.evidence
    };
  }
}

module.exports = AnalysisResultContract;
