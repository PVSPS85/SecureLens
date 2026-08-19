const HOMOGLYPH_MAP = {
  'а': 'a', 'с': 'c', 'е': 'e', 'о': 'o', 'р': 'p', 'х': 'x', 'у': 'y' // Cyrillic
};

class HomoglyphDetector {
  /**
   * Checks for confusable homoglyphs and normalizes string to canonical Latin form.
   * @param {string} domain 
   */
  static analyzeHomoglyphs(domain) {
    if (!domain) return { containsHomoglyphs: false, normalizedDomain: '' };

    let normalized = domain.toLowerCase();
    let containsHomoglyphs = false;

    for (const [confusable, original] of Object.entries(HOMOGLYPH_MAP)) {
      if (normalized.includes(confusable)) {
        containsHomoglyphs = true;
        normalized = normalized.split(confusable).join(original);
      }
    }

    return {
      containsHomoglyphs,
      original: domain,
      normalizedDomain: normalized
    };
  }
}

module.exports = HomoglyphDetector;
