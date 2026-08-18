class RulebookEngine {
  /**
   * Evaluates aggregated evidence facts and assigns a risk score.
   * @param {Object} evidencePayload - EvidenceContract JSON output
   */
  static evaluate(evidencePayload) {
    let riskScore = 0;
    const detectedRisks = [];
    const analyzers = evidencePayload.analyzers || {};

    // Domain Age Rules
    const whois = analyzers.whois?.data;
    if (whois && whois.domainAgeDays !== null) {
      if (whois.domainAgeDays < 7) {
        riskScore += 40;
        detectedRisks.push('CRITICAL: Extremely new domain (< 7 days old)');
      } else if (whois.domainAgeDays < 30) {
        riskScore += 25;
        detectedRisks.push('HIGH: Recently registered domain (< 30 days old)');
      }
    }

    // Lookalike / Impersonation Rules
    const lookalike = analyzers.lookalike?.data;
    if (lookalike?.potentialImpersonation) {
      riskScore += 35;
      detectedRisks.push(`HIGH: Potential brand impersonation detected for ${lookalike.matchedBrands[0]?.brand}`);
    }
    if (lookalike?.containsHomoglyphs) {
      riskScore += 20;
      detectedRisks.push('MEDIUM: Contains IDN/homoglyph character substitutions');
    }

    // TLS Certificate Rules
    const tls = analyzers.tls?.data;
    if (tls) {
      if (tls.isExpired) {
        riskScore += 15;
        detectedRisks.push('MEDIUM: TLS certificate is expired');
      }
      if (tls.isSelfSigned) {
        riskScore += 20;
        detectedRisks.push('MEDIUM: Self-signed TLS certificate');
      }
    }

    // Cap score at 100
    const finalScore = Math.min(100, riskScore);

    return {
      riskScore: finalScore,
      riskLevel: this.getRiskLevel(finalScore),
      detectedRisks
    };
  }

  static getRiskLevel(score) {
    if (score >= 75) return 'CRITICAL';
    if (score >= 50) return 'HIGH';
    if (score >= 25) return 'MEDIUM';
    return 'LOW';
  }
}

module.exports = RulebookEngine;
