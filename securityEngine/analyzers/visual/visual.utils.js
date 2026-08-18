class VisualUtils {
  /**
   * Pre-filters visual payload options.
   * @param {Buffer} screenshotBuffer 
   */
  static prepareScreenshotMetadata(screenshotBuffer) {
    if (!Buffer.isBuffer(screenshotBuffer)) {
      return { isValid: false, sizeKb: 0 };
    }

    return {
      isValid: true,
      sizeKb: Number((screenshotBuffer.length / 1024).toFixed(2))
    };
  }
}

module.exports = VisualUtils;
