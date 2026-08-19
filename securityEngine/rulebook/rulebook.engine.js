/**
 * ============================================================================
 * SecureLens RulebookEngine — Paranoia Mode (2026.08 Revision)
 * ============================================================================
 *
 * Zero-trust compound scoring. Rules are evaluated in priority order:
 *
 *  ┌─ INSTANT 100 ───────────────────────────────────────────────────────────┐
 *  │  • Threat Intelligence confirmed malicious match (VirusTotal, etc.)     │
 *  │  • Password/input form served over plain HTTP (no TLS whatsoever)       │
 *  │  • Punycode / IDN homoglyph domain detected                             │
 *  └─────────────────────────────────────────────────────────────────────────┘
 *
 *  ┌─ HEAVY CRITICALS (additive, pre-cap) ──────────────────────────────────┐
 *  │  • Raw IP address target (no registered domain)            → +85        │
 *  │  • Brand impersonation / lookalike detected                → +70        │
 *  │  • Domain age < 7 days                                     → +60        │
 *  └─────────────────────────────────────────────────────────────────────────┘
 *
 *  ┌─ COMPOUND PHISHING PENALTIES (require ≥2 indicators) ──────────────────┐
 *  │  • Domain age < 30 days  AND  has password/login field     → +80        │
 *  │  • Self-signed OR expired TLS certificate                  → +60        │
 *  └─────────────────────────────────────────────────────────────────────────┘
 *
 *  ┌─ MEDIUM / HIGH ADDITIONS ───────────────────────────────────────────────┐
 *  │  • Redirect chain > 3 hops                                 → +30        │
 *  │  • Missing HSTS or CSP headers                             → +20        │
 *  │  • Domain age < 30 days  (without password field)          → +40        │
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
   * @param {Object} evidencePayload - EvidenceContract JSON output
   * @returns {{ riskScore: number, riskLevel: string, detectedRisks: string[] }}
   */
  static evaluate(evidencePayload) {
    let score = 0;
    const detectedRisks = [];
    const analyzers = evidencePayload.analyzers || {};

    // ─────────────────────────────────────────────────────────────────────────
    // Extract all relevant evidence sub-objects up-front for readability
    // ─────────────────────────────────────────────────────────────────────────
    const whois       = analyzers.whois?.data               || null;
    const lookalike   = analyzers.lookalike?.data            || null;
    const tls         = analyzers.tls?.data                  || null;
    const http        = analyzers.http?.data                 || null;
    const browser     = analyzers.browser?.data              || null;
    const domain      = analyzers.domain?.data               || null;
    const redirects   = analyzers.redirects?.data            || null;
    const threatIntel = analyzers['threat-intelligence']?.data || null;

    // Derived flags used across multiple rules
    const domainAgeDays    = whois?.domainAgeDays ?? null;
    const hasPasswordField = !!(browser?.hasPasswordField);
    const isRawIp          = !!(domain?.isIP);
    const hasTls           = !!(tls?.valid);
    const tlsExpired       = !!(tls?.isExpired);
    const tlsSelfSigned    = !!(tls?.isSelfSigned);

    // =========================================================================
    // TIER 1 — INSTANT 100: Any single match forces maximum risk immediately
    // =========================================================================

    // 1a. Threat Intelligence confirmed malicious flag
    if (threatIntel?.isKnownMalicious || threatIntel?.maliciousCount > 0) {
      return this._finalise(
        100,
        ['INSTANT_100: Threat Intelligence confirmed malicious target (VirusTotal / blacklist match)'],
      );
    }

    // 1b. Password / credential-entry form served over plain HTTP (no TLS at all)
    //     This is the classic phishing setup: harvest creds over an unencrypted channel.
    if (hasPasswordField && !hasTls) {
      return this._finalise(
        100,
        ['INSTANT_100: Credential-harvesting form (password input) served over unencrypted plain HTTP'],
      );
    }

    // 1c. Punycode / IDN homoglyph domain spoofing a legitimate brand
    //     containsHomoglyphs is the definitive signal from the LookalikeAnalyzer.
    if (lookalike?.containsHomoglyphs) {
      return this._finalise(
        100,
        ['INSTANT_100: Punycode / IDN homoglyph character substitution detected — active domain spoofing attack'],
      );
    }

    // =========================================================================
    // TIER 2 — HEAVY CRITICALS (additive — may stack to cap)
    // =========================================================================

    // 2a. Target is a raw IP address, not a registered domain
    if (isRawIp) {
      score += 85;
      detectedRisks.push('CRITICAL: Target is a raw IP address — no registered domain, no CA-validated identity');
    }

    // 2b. Brand impersonation / lookalike string match
    if (lookalike?.potentialImpersonation) {
      score += 70;
      const brand = lookalike.matchedBrands?.[0]?.brand || 'a known brand';
      detectedRisks.push(`CRITICAL: Brand impersonation detected — string closely matches "${brand}"`);
    }

    // 2c. Ultra-new domain (< 7 days) — registered specifically for this campaign
    if (domainAgeDays !== null && domainAgeDays < 7) {
      score += 60;
      detectedRisks.push(`CRITICAL: Domain is only ${domainAgeDays} day(s) old — typical throwaway phishing registration`);
    }

    // =========================================================================
    // TIER 3 — COMPOUND PHISHING PENALTIES (require ≥2 concurrent indicators)
    // =========================================================================

    // 3a. Young domain + password form  → compound phishing kit fingerprint
    if (domainAgeDays !== null && domainAgeDays < 30 && hasPasswordField) {
      score += 80;
      detectedRisks.push(
        `COMPOUND: Domain registered ${domainAgeDays} day(s) ago AND hosts a credential-entry form — high-confidence phishing kit`,
      );
    }

    // 3b. Self-signed OR expired TLS — certificate is not trustworthy
    if (tlsSelfSigned || tlsExpired) {
      score += 60;
      const reason = tlsExpired ? 'expired' : 'self-signed';
      detectedRisks.push(
        `COMPOUND: TLS certificate is ${reason} — data in transit may be intercepted or the issuer is unverifiable`,
      );
    }

    // =========================================================================
    // TIER 4 — MEDIUM / HIGH ADDITIONS (standalone signals)
    // =========================================================================

    // 4a. Redirect chain > 3 hops — masking final destination
    const redirectCount = redirects?.chain?.length ?? redirects?.hops ?? 0;
    if (redirectCount > 3) {
      score += 30;
      detectedRisks.push(
        `HIGH: Redirect chain is ${redirectCount} hops deep — obscures the actual destination URL`,
      );
    }

    // 4b. Missing critical HTTP security headers (HSTS and/or CSP)
    if (http?.headers) {
      const h = http.headers;
      const missingHeaders = [];
      const hsts = h['strict-transport-security'] || h['Strict-Transport-Security'];
      const csp  = h['content-security-policy']   || h['Content-Security-Policy'];
      if (!hsts) missingHeaders.push('HSTS');
      if (!csp)  missingHeaders.push('CSP');
      if (missingHeaders.length > 0) {
        score += 20;
        detectedRisks.push(`MEDIUM: Missing critical security header(s): ${missingHeaders.join(', ')}`);
      }
    }

    // 4c. Domain age < 30 days without a password field (pure age signal, no compound)
    //     Only apply if the compound rule (3a) was NOT already triggered to avoid double-counting
    const compoundAgeAlreadyApplied = (domainAgeDays !== null && domainAgeDays < 30 && hasPasswordField);
    if (domainAgeDays !== null && domainAgeDays < 30 && domainAgeDays >= 7 && !compoundAgeAlreadyApplied) {
      score += 40;
      detectedRisks.push(`HIGH: Domain was registered ${domainAgeDays} day(s) ago — recently created domains are high-risk`);
    }

    // =========================================================================
    // MATH SAFETY — clamp to [0, 100]
    // =========================================================================
    const riskScore = Math.min(100, Math.max(0, Math.round(score)));

    return {
      riskScore,
      riskLevel: this.getRiskLevel(riskScore),
      detectedRisks,
    };
  }

  /**
   * Short-circuit helper used by INSTANT_100 rules.
   * Skips all remaining evaluation and returns the maximum score immediately.
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
   *
   *  0 – 15  → LOW       (only near-perfect, well-established sites)
   * 16 – 40  → MEDIUM
   * 41 – 75  → HIGH
   * 76 – 100 → CRITICAL
   */
  static getRiskLevel(score) {
    if (score >= 76) return 'CRITICAL';
    if (score >= 41) return 'HIGH';
    if (score >= 16) return 'MEDIUM';
    return 'LOW';
  }
}

module.exports = RulebookEngine;
