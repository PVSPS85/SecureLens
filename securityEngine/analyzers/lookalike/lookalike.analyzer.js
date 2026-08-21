const BaseAnalyzer = require('../../contracts/analyzer.interface');
const DomainSimilarity = require('./domain-similarity');
const HomoglyphDetector = require('./homoglyph');

// Target protected brands dictionary with proper display names
const BRAND_MAP = {
  google: 'Google',
  microsoft: 'Microsoft',
  paypal: 'PayPal',
  amazon: 'Amazon',
  apple: 'Apple',
  facebook: 'Facebook / Meta',
  meta: 'Meta',
  github: 'GitHub',
  statebank: 'State Bank',
  sbi: 'SBI',
  netflix: 'Netflix',
  coinbase: 'Coinbase',
  instagram: 'Instagram',
  whatsapp: 'WhatsApp',
  telegram: 'Telegram',
  binance: 'Binance',
  adobe: 'Adobe',
  dropbox: 'Dropbox',
  yahoo: 'Yahoo',
  twitter: 'Twitter / X',
  linkedin: 'LinkedIn',
  walmart: 'Walmart',
  chase: 'Chase Bank',
  wellsfargo: 'Wells Fargo',
  steam: 'Steam',
  roblox: 'Roblox',
  bankofamerica: 'Bank of America',
  citibank: 'Citibank',
  blockchain: 'Blockchain'
};

// Common phishing/infrastructure keywords
const SUSPICIOUS_KEYWORDS = [
  'login', 'verify', 'auth', 'secure', 'security', 'update',
  'portal', 'support', 'account', 'signin', 'confirm', 'wallet',
  'recovery', 'service', 'payment', 'billing', 'banking', 'partner'
];

class LookalikeAnalyzer extends BaseAnalyzer {
  constructor() {
    super('lookalike');
  }

  async analyze(context) {
    const rawHost = context.hostname || context.value || '';
    const cleanHost = rawHost.toLowerCase().trim();

    // Extract true SLD and domain tokens
    const parts = cleanHost.split('.');
    const sld = parts.length >= 2 ? parts[parts.length - 2] : parts[0];
    const fullDomainPrefix = parts.slice(0, -1).join('-');

    const isPunycode = cleanHost.startsWith('xn--') || cleanHost.includes('.xn--');
    const homoglyphResult = HomoglyphDetector.analyzeHomoglyphs(cleanHost);
    const brandMatches = [];

    // 1. Check against protected high-value brands
    for (const [key, displayName] of Object.entries(BRAND_MAP)) {
      // Substring containment check (e.g. "paypal-security", "login-google", "apple-support")
      if (sld.includes(key) || fullDomainPrefix.includes(key)) {
        if (cleanHost !== `${key}.com` && cleanHost !== `www.${key}.com`) {
          brandMatches.push({
            brand: displayName,
            similarityScore: 0.90,
            matchType: 'brand_substring_containment'
          });
          continue;
        }
      }

      // Levenshtein ratio on normalized domain text
      const normalizedSld = homoglyphResult.normalizedDomain.split('.')[0] || sld;
      const score = DomainSimilarity.calculateSimilarityRatio(normalizedSld, key);
      if (score >= 0.70 && sld !== key) {
        brandMatches.push({
          brand: displayName,
          similarityScore: parseFloat(score.toFixed(3)),
          matchType: 'visual_similarity'
        });
      }
    }

    // 2. Homoglyph / Punycode substitution check
    const containsHomoglyphs = Boolean(homoglyphResult.containsHomoglyphs || isPunycode);
    if (containsHomoglyphs && brandMatches.length === 0) {
      brandMatches.push({
        brand: 'IDN Homoglyph Spoof',
        similarityScore: 0.95,
        matchType: 'homoglyph_character_substitution'
      });
    }

    // 3. Phishing infrastructure keyword pattern matching
    const matchedKeywords = SUSPICIOUS_KEYWORDS.filter(kw => sld.includes(kw) || fullDomainPrefix.includes(kw));
    const isSuspiciousKeyword = matchedKeywords.length > 0 && sld.length > 5;
    
    if (isSuspiciousKeyword && brandMatches.length === 0) {
      brandMatches.push({
        brand: 'Suspicious Infrastructure',
        similarityScore: 0.82,
        matchType: 'phishing_keyword_infrastructure',
        matchedKeywords
      });
    }

    const potentialImpersonation = brandMatches.length > 0;

    const evidence = {
      secondLevelDomain: sld,
      isPunycode,
      containsHomoglyphs,
      potentialImpersonation,
      matchedBrands: brandMatches
    };

    return this.formatResult(true, evidence);
  }
}

module.exports = LookalikeAnalyzer;
