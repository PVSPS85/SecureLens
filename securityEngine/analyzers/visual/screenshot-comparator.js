class ScreenshotComparator {
  /**
   * Computes Hamming distance between two hex/binary perceptual hashes.
   * @param {string} hashA 
   * @param {string} hashB 
   */
  static calculateHammingDistance(hashA, hashB) {
    if (!hashA || !hashB || hashA.length !== hashB.length) return 999;

    let distance = 0;
    for (let i = 0; i < hashA.length; i++) {
      if (hashA[i] !== hashB[i]) distance++;
    }

    return distance;
  }
}

module.exports = ScreenshotComparator;
