class RulebookEngine {
  /**
   * Evaluates aggregated evidence facts and assigns a risk score.
   * @param {Object} evidencePayload - EvidenceContract JSON output
   *
   * Scoring weights (2026.08 rulebook revision):
   *   CRITICAL: Lookalike / homoglyph match       → +50
   *   CRITICAL: No HTTPS / expired TLS            → +40
   *   CRITICAL: Extremely new domain (< 7 days)   → +40
   *   HIGH:     Brand impersonation indicator      → +35
   *   HIGH:     Domain registered < 30 days        → +25
   *   HIGH:     Self-signed TLS cert               → +25
   *   MEDIUM:   Missing security headers (HSTS/CSP)→ +15
   *   MEDIUM:   Expired TLS cert                   → +15
   *   MEDIUM:   Has password form on young domain  → +10 bonus
   *   All scores capped at 100.
   */
  static evaluate(evidencePayload) {
    let riskScore = 0;
    const detectedRisks = [];
    const analyzers = evidencePayload.analyzers || {};

    // ── Domain Age Rules ────────────────────────────────────────────────────
    const whois = analyzers.whois?.data;
    if (whois && whois.domainAgeDays !== null && whois.domainAgeDays !== undefined) {
      if (whois.domainAgeDays < 7) {
        riskScore += 40;
        detectedRisks.push('CRITICAL: Extremely new domain (< 7 days old)');
      } else if (whois.domainAgeDays < 30) {
        riskScore += 25;
        detectedRisks.push('HIGH: Recently registered domain (< 30 days old)');
      }
    }

    // ── Lookalike / Impersonation Rules ─────────────────────────────────────
    const lookalike = analyzers.lookalike?.data;
    if (lookalike?.potentialImpersonation) {
      riskScore += 35;
      const brand = lookalike.matchedBrands?.[0]?.brand || 'a known brand';
      detectedRisks.push(`HIGH: Potential brand impersonation detected for ${brand}`);
    }
    if (lookalike?.containsHomoglyphs) {
      // Homoglyphs are a primary credential-phishing vector — CRITICAL weight
      riskScore += 50;
      detectedRisks.push('CRITICAL: Contains IDN/homoglyph character substitutions (active lookalike signal)');
    }

    // ── TLS / HTTPS Rules ───────────────────────────────────────────────────
    const tls = analyzers.tls?.data;
    if (tls) {
      if (!tls.valid || tls.isExpired) {
        // Expired or invalid TLS on a site collecting data is CRITICAL
        riskScore += 40;
        detectedRisks.push('CRITICAL: TLS certificate is expired or invalid — data in transit is unprotected');
      } else if (tls.isSelfSigned) {
        // Self-signed is HIGH — could be intercepting traffic
        riskScore += 25;
        detectedRisks.push('HIGH: Self-signed TLS certificate — not trusted by public certificate authorities');
      }
    }

    // Absence of TLS data entirely suggests HTTP-only
    if (!tls || (!tls.valid && !tls.isExpired && !tls.isSelfSigned)) {
      const domainData = analyzers.domain?.data;
      // Only flag HTTP if it's a real domain (not IP-only) and TLS is entirely missing
      if (domainData && !domainData.isIP && !tls?.valid) {
        riskScore += 40;
        detectedRisks.push('CRITICAL: Target does not serve HTTPS — all communication is unencrypted');
      }
    }

    // ── HTTP Security Header Rules ───────────────────────────────────────────
    const http = analyzers.http?.data;
    if (http && http.headers) {
      const headers = http.headers;
      const missingHeaders = [];

      // HSTS prevents protocol-downgrade attacks
      if (!headers['strict-transport-security'] && !headers['Strict-Transport-Security']) {
        missingHeaders.push('HSTS');
      }
      // CSP blocks XSS and data-injection attacks
      if (!headers['content-security-policy'] && !headers['Content-Security-Policy']) {
        missingHeaders.push('CSP');
      }

      if (missingHeaders.length > 0) {
        riskScore += 15;
        detectedRisks.push(`MEDIUM: Missing critical security headers: ${missingHeaders.join(', ')}`);
      }
    }

    // ── Password Form Bonus on Young/Suspicious Domains ─────────────────────
    const browser = analyzers.browser?.data;
    if (browser?.hasPasswordField && whois && whois.domainAgeDays < 30) {
      riskScore += 10;
      detectedRisks.push('MEDIUM: Credential-entry form detected on a recently registered domain');
    }

    // ── Cap score at 100 ────────────────────────────────────────────────────
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
