class ThreatIntelUtils {
  /**
   * Calculates consensus risk level from engines array.
   * @param {number} malicious 
   * @param {number} totalEngines 
   */
  static calculateConsensus(malicious = 0, totalEngines = 1) {
    if (totalEngines <= 0) return { ratio: 0, isConsensusMalicious: false };

    const ratio = Number((malicious / totalEngines).toFixed(2));
    return {
      ratio,
      isConsensusMalicious: ratio >= 0.05 || malicious >= 3
    };
  }
}

module.exports = ThreatIntelUtils;
