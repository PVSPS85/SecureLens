class DomainSimilarity {
  /**
   * Computes standard Levenshtein distance between two strings.
   * @param {string} a 
   * @param {string} b 
   */
  static levenshteinDistance(a, b) {
    if (!a) return b ? b.length : 0;
    if (!b) return a.length;

    const matrix = [];

    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[b.length][a.length];
  }

  /**
   * Normalized similarity score between 0.0 (unrelated) and 1.0 (identical).
   */
  static calculateSimilarityRatio(str1, str2) {
    const distance = this.levenshteinDistance(str1.toLowerCase(), str2.toLowerCase());
    const maxLength = Math.max(str1.length, str2.length);
    if (maxLength === 0) return 1.0;
    return Number((1 - distance / maxLength).toFixed(4));
  }
}

module.exports = DomainSimilarity;
