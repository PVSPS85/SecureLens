const BaseAnalyzer = require('../../contracts/analyzer.interface');
const DomainSimilarity = require('./domain-similarity');
const HomoglyphDetector = require('./homoglyph');

// Target protected brands list
const PROTECTED_BRANDS = ['google', 'microsoft', 'paypal', 'amazon', 'apple', 'facebook', 'github', 'statebank'];

class LookalikeAnalyzer extends BaseAnalyzer {
  constructor() {
    super('lookalike');
  }

  async analyze(context) {
    const domain = context.hostname || context.value;
    const sld = domain.split('.')[0] || domain;

    const homoglyphResult = HomoglyphDetector.analyzeHomoglyphs(sld);
    const brandMatches = [];

    for (const brand of PROTECTED_BRANDS) {
      const score = DomainSimilarity.calculateSimilarityRatio(homoglyphResult.normalizedDomain, brand);
      if (score >= 0.75 && sld !== brand) {
        brandMatches.push({ brand, similarityScore: score });
      }
    }

    const evidence = {
      secondLevelDomain: sld,
      containsHomoglyphs: homoglyphResult.containsHomoglyphs,
      potentialImpersonation: brandMatches.length > 0,
      matchedBrands: brandMatches
    };

    return this.formatResult(true, evidence);
  }
}

module.exports = LookalikeAnalyzer;
