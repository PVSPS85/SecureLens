class TyposquattingDetector {
  /**
   * Calculates Damerau-Levenshtein edit distance for transposition and typo checks.
   */
  static damerauLevenshtein(a, b) {
    if (!a || !b) return Math.max(a?.length || 0, b?.length || 0);

    const m = a.length;
    const n = b.length;
    const d = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

    for (let i = 0; i <= m; i++) d[i][0] = i;
    for (let j = 0; j <= n; j++) d[0][j] = j;

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        d[i][j] = Math.min(
          d[i - 1][j] + 1,      // deletion
          d[i][j - 1] + 1,      // insertion
          d[i - 1][j - 1] + cost // substitution
        );

        if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
          d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + cost); // transposition
        }
      }
    }

    return d[m][n];
  }
}

module.exports = TyposquattingDetector;
