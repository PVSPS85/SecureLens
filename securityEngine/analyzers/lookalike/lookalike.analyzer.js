const BaseAnalyzer = require('../../contracts/analyzer.interface');
const DomainSimilarity = require('./domain-similarity');
const HomoglyphDetector = require('./homoglyph');

const BaseAnalyzer = require('../../contracts/analyzer.interface');
const DomainSimilarity = require('./domain-similarity');
const HomoglyphDetector = require('./homoglyph');

// Target protected brands list (expanded for high-value phishing targets)
const PROTECTED_BRANDS = [
  'google', 'microsoft', 'paypal', 'amazon', 'apple', 'facebook',
  'github', 'statebank', 'netflix', 'coinbase', 'instagram', 'whatsapp',
  'telegram', 'binance', 'adobe', 'dropbox', 'yahoo', 'twitter',
  'linkedin', 'walmart', 'chase', 'wellsfargo', 'steam', 'roblox'
];

class LookalikeAnalyzer extends BaseAnalyzer {
  constructor() {
    super('lookalike');
  }

  async analyze(context) {
    const rawHost = context.hostname || context.value || '';
    const cleanHost = rawHost.toLowerCase().trim();

    // Extract true SLD and domain tokens (e.g., from 'login.paypal-security.com' -> ['login', 'paypal-security'])
    const parts = cleanHost.split('.');
    const sld = parts.length >= 2 ? parts[parts.length - 2] : parts[0];
    const fullDomainPrefix = parts.slice(0, -1).join('-');

    const isPunycode = cleanHost.startsWith('xn--') || cleanHost.includes('.xn--');
    const homoglyphResult = HomoglyphDetector.analyzeHomoglyphs(cleanHost);
    const brandMatches = [];

    for (const brand of PROTECTED_BRANDS) {
      // 1. Check substring containment (e.g., "paypal-security", "login-google")
      if (sld.includes(brand) || fullDomainPrefix.includes(brand)) {
        if (cleanHost !== `${brand}.com` && cleanHost !== `www.${brand}.com`) {
          brandMatches.push({
            brand,
            similarityScore: 0.90,
            matchType: 'brand_substring_containment'
          });
          continue;
        }
      }

      // 2. Levenshtein ratio on homoglyph-normalized domain
      const normalizedSld = homoglyphResult.normalizedDomain.split('.')[0] || sld;
      const score = DomainSimilarity.calculateSimilarityRatio(normalizedSld, brand);
      if (score >= 0.70 && sld !== brand) {
        brandMatches.push({
          brand,
          similarityScore: parseFloat(score.toFixed(3)),
          matchType: 'visual_similarity'
        });
      }
    }

    const containsHomoglyphs = Boolean(homoglyphResult.containsHomoglyphs || isPunycode);
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
