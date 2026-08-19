/**
 * ============================================================================
 * SecureLens RulebookEngine — Paranoia Mode (2026.08 Revision)
 * ============================================================================
 *
 * Zero-trust compound scoring. Rules are evaluated in priority order.
 *
 * EXACT ANALYZER OUTPUT PATHS (verified against each analyzer source):
 *
 *  analyzers.domain.data
 *    └─ isPunycode          boolean  (from DomainAnalyzer)
 *
 *  analyzers.lookalike.data
 *    └─ containsHomoglyphs  boolean
 *    └─ potentialImpersonation boolean
 *    └─ matchedBrands       [{brand, similarityScore}]
 *
 *  analyzers.tls.data
 *    └─ isExpired           boolean
 *    └─ isSelfSigned        boolean
 *    └─ authorized          boolean   ← "valid TLS" indicator (no .valid key)
 *
 *  analyzers.whois.data
 *    └─ domainAgeDays       number | null
 *
 *  analyzers.http.data
 *    └─ securityHeaders.hasHSTS  boolean   ← NOT raw headers object
 *    └─ securityHeaders.hasCSP   boolean
 *
 *  analyzers.redirects.data
 *    └─ totalHops           number   (chain.length - 1)
 *
 *  analyzers.browser.data
 *    └─ hasPasswordField    boolean
 *
 *  analyzers['threat-intelligence'].data
 *    └─ isKnownMalicious    boolean
 *    └─ maliciousCount      number
 *
 *  evidencePayload.targetType  string  'ip' | 'domain' | 'url'
 *    (raw IP target check lives on the top-level targetType, not inside data)
 *
 * ─────────────────────────────────────────────────────────────────────────────
 *  ┌─ INSTANT 100 ───────────────────────────────────────────────────────────┐
 *  │  • Threat Intelligence confirmed malicious (isKnownMalicious = true)    │
 *  │  • Password form + no TLS authorization (authorized = false, no cert)   │
 *  │  • Punycode / IDN homoglyph detected (containsHomoglyphs = true)        │
 *  └─────────────────────────────────────────────────────────────────────────┘
 *
 *  ┌─ HEAVY CRITICALS (additive) ───────────────────────────────────────────┐
 *  │  • targetType === 'ip' (raw IP — no registered domain)     → +85        │
 *  │  • potentialImpersonation (brand lookalike string match)   → +70        │
 *  │  • domainAgeDays < 7                                       → +60        │
 *  └─────────────────────────────────────────────────────────────────────────┘
 *
 *  ┌─ COMPOUND PHISHING PENALTIES (≥2 concurrent indicators) ───────────────┐
 *  │  • domainAgeDays < 30  AND  hasPasswordField               → +80        │
 *  │  • isSelfSigned OR isExpired                               → +60        │
 *  └─────────────────────────────────────────────────────────────────────────┘
 *
 *  ┌─ MEDIUM / HIGH ADDITIONS ───────────────────────────────────────────────┐
 *  │  • totalHops > 3                                           → +30        │
 *  │  • !hasHSTS or !hasCSP                                     → +20        │
 *  │  • domainAgeDays < 30 (without password field)             → +40        │
 *  └─────────────────────────────────────────────────────────────────────────┘
 *
 *  ┌─ RISK BANDS ────────────────────────────────────────────────────────────┐
 *  │   0 – 15  → LOW      (near-perfect, well-established sites only)        │
 *  │  16 – 40  → MEDIUM                                                      │
 *  │  41 – 75  → HIGH                                                        │
 *  │  76 – 100 → CRITICAL                                                    │
 *  └─────────────────────────────────────────────────────────────────────────┘
 */

class RulebookEngine {
  /**
   * Evaluates aggregated evidence facts and assigns a compound risk score.
   *
   * @param {Object} evidencePayload - EvidenceContract .toJSON() output:
   *   {
   *     target:     string,
   *     targetType: 'ip' | 'domain' | 'url',
   *     analyzers:  { [name]: { analyzer, success, data, error } }
   *   }
   * @returns {{ riskScore: number, riskLevel: string, detectedRisks: string[] }}
   */
  static evaluate(evidencePayload) {
    let score = 0;
    const detectedRisks = [];
    const analyzers = evidencePayload.analyzers || {};

    // ── Extract each analyzer's .data payload (guard against missing/failed) ──
    const domainData  = analyzers.domain?.data                   || {};
    const lookData    = analyzers.lookalike?.data                || {};
    const tlsData     = analyzers.tls?.data                     || {};
    const whoisData   = analyzers.whois?.data                   || {};
    const httpData    = analyzers.http?.data                     || {};
    const redirData   = analyzers.redirects?.data               || {};
    const browserData = analyzers.browser?.data                 || {};
    const tiData      = analyzers['threat-intelligence']?.data  || {};

    // ── Derived convenience flags ─────────────────────────────────────────────

    // targetType === 'ip' is the authoritative raw-IP signal (DomainAnalyzer
    // does not emit an isIP field; the type comes from TargetUtils.parseTarget)
    const isRawIp = evidencePayload.targetType === 'ip';

    // WHOIS: age in days (null means unknown / WHOIS failed)
    const domainAgeDays = typeof whoisData.domainAgeDays === 'number'
      ? whoisData.domainAgeDays
      : null;

    // Browser: credential-entry form present
    const hasPasswordField = Boolean(browserData.hasPasswordField);

    // TLS: "authorized" = true means a valid, CA-signed, non-expired certificate.
    // There is NO `.valid` key — the analyzer uses `.authorized`.
    const tlsAuthorized  = Boolean(tlsData.authorized);   // true = good TLS
    const tlsExpired     = Boolean(tlsData.isExpired);
    const tlsSelfSigned  = Boolean(tlsData.isSelfSigned);

    // HTTP security headers — stored as pre-computed booleans under securityHeaders
    const secHeaders = httpData.securityHeaders || {};
    const hasHSTS    = Boolean(secHeaders.hasHSTS);
    const hasCSP     = Boolean(secHeaders.hasCSP);

    // Lookalike / homoglyph
    const containsHomoglyphs     = Boolean(lookData.containsHomoglyphs);
    const potentialImpersonation = Boolean(lookData.potentialImpersonation);

    // Redirect chain depth — the field is `totalHops` (chain.length - 1)
    const totalHops = typeof redirData.totalHops === 'number' ? redirData.totalHops : 0;

    // Threat intelligence
    const isKnownMalicious = Boolean(tiData.isKnownMalicious) || (tiData.maliciousCount > 0);

    // =========================================================================
    // TIER 1 — INSTANT 100 (short-circuit — returns immediately)
    // =========================================================================

    // 1a. Threat Intelligence confirmed malicious flag
    if (isKnownMalicious) {
      return this._finalise(100, [
        'INSTANT_100: Threat Intelligence confirmed malicious target (VirusTotal / blacklist match)',
      ]);
    }

    // 1b. Credential-entry form served with no valid TLS
    //     (authorized = false means TLS is absent, self-signed, or untrusted)
    if (hasPasswordField && !tlsAuthorized) {
      return this._finalise(100, [
        'INSTANT_100: Credential-harvesting form (password input) served without a valid, CA-trusted TLS certificate',
      ]);
    }

    // 1c. Punycode / IDN homoglyph domain spoofing
    //     containsHomoglyphs comes from LookalikeAnalyzer → HomoglyphDetector
    if (containsHomoglyphs) {
      return this._finalise(100, [
        'INSTANT_100: Punycode / IDN homoglyph character substitution detected — active domain-spoofing attack',
      ]);
    }

    // =========================================================================
    // TIER 2 — HEAVY CRITICALS (additive)
    // =========================================================================

    // 2a. Raw IP address — no registered domain, no CA-validated identity
    if (isRawIp) {
      score += 85;
      detectedRisks.push('CRITICAL: Target is a raw IP address — no registered domain or CA-validated identity');
    }

    // 2b. Brand impersonation — string similarity ≥ 0.75 against protected brands
    if (potentialImpersonation) {
      score += 70;
      const brand = lookData.matchedBrands?.[0]?.brand || 'a known brand';
      const simPct = lookData.matchedBrands?.[0]?.similarityScore
        ? Math.round(lookData.matchedBrands[0].similarityScore * 100)
        : null;
      detectedRisks.push(
        `CRITICAL: Brand impersonation detected — domain closely matches "${brand}"` +
        (simPct !== null ? ` (${simPct}% similarity)` : '')
      );
    }

    // 2c. Ultra-new domain (< 7 days) — registered for a throwaway campaign
    if (domainAgeDays !== null && domainAgeDays < 7) {
      score += 60;
      detectedRisks.push(
        `CRITICAL: Domain is only ${domainAgeDays} day(s) old — typical throwaway phishing registration`
      );
    }

    // =========================================================================
    // TIER 3 — COMPOUND PHISHING PENALTIES (≥2 concurrent signals)
    // =========================================================================

    // 3a. Young domain + credential-entry form → compound phishing kit fingerprint
    if (domainAgeDays !== null && domainAgeDays < 30 && hasPasswordField) {
      score += 80;
      detectedRisks.push(
        `COMPOUND: Domain registered only ${domainAgeDays} day(s) ago AND hosts a credential-entry form — high-confidence phishing kit`
      );
    }

    // 3b. Self-signed or expired TLS → certificate is untrustworthy
    if (tlsSelfSigned || tlsExpired) {
      score += 60;
      const reason = tlsExpired ? 'expired' : 'self-signed';
      detectedRisks.push(
        `COMPOUND: TLS certificate is ${reason} — data in transit may be intercepted or the issuer is unverifiable`
      );
    }

    // =========================================================================
    // TIER 4 — MEDIUM / HIGH ADDITIONS (standalone signals)
    // =========================================================================

    // 4a. Redirect chain > 3 hops — masking the real destination
    if (totalHops > 3) {
      score += 30;
      detectedRisks.push(
        `HIGH: Redirect chain is ${totalHops} hop(s) deep — obscures the actual destination URL`
      );
    }

    // 4b. Missing critical HTTP security headers
    //     HTTPAnalyzer stores pre-computed booleans at securityHeaders.hasHSTS / hasCSP
    const missingHeaders = [];
    if (!hasHSTS) missingHeaders.push('HSTS');
    if (!hasCSP)  missingHeaders.push('CSP');
    if (missingHeaders.length > 0) {
      score += 20;
      detectedRisks.push(`MEDIUM: Missing critical security header(s): ${missingHeaders.join(', ')}`);
    }

    // 4c. Domain age < 30 days — standalone age signal (only when compound not fired)
    //     Guard: skip if the compound rule (3a) already accounted for this age+form pair
    const compoundAgeFired = (domainAgeDays !== null && domainAgeDays < 30 && hasPasswordField);
    if (domainAgeDays !== null && domainAgeDays < 30 && domainAgeDays >= 7 && !compoundAgeFired) {
      score += 40;
      detectedRisks.push(
        `HIGH: Domain was registered only ${domainAgeDays} day(s) ago — recently created domains carry elevated risk`
      );
    }

    // =========================================================================
    // MATH SAFETY — clamp strictly to [0, 100]
    // =========================================================================
    const riskScore = Math.min(100, Math.max(0, Math.round(score)));

    return {
      riskScore,
      riskLevel: this.getRiskLevel(riskScore),
      detectedRisks,
    };
  }

  /**
   * Short-circuit helper for INSTANT_100 rules.
   */
  static _finalise(score, risks) {
    return {
      riskScore: score,
      riskLevel: this.getRiskLevel(score),
      detectedRisks: risks,
    };
  }

  /**
   * Maps a numeric score to a named risk band.
   *   0 – 15  → LOW      (near-perfect, established, well-configured sites only)
   *  16 – 40  → MEDIUM
   *  41 – 75  → HIGH
   *  76 – 100 → CRITICAL
   */
  static getRiskLevel(score) {
    if (score >= 76) return 'CRITICAL';
    if (score >= 41) return 'HIGH';
    if (score >= 16) return 'MEDIUM';
    return 'LOW';
  }
}

module.exports = RulebookEngine;
