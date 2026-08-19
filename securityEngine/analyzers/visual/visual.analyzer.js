const BaseAnalyzer = require('../../contracts/analyzer.interface');

class VisualAnalyzer extends BaseAnalyzer {
  constructor() {
    super('visual');
  }

  async analyze(context) {
    try {
      // screenshotBuffer is set by BrowserAnalyzer on the shared context object
      // so both analyzers can reference the same captured image.
      const screenshotBase64 = context.screenshotBuffer || null;

      const evidence = {
        hasScreenshot: Boolean(screenshotBase64),
        screenshot: screenshotBase64,           // base64 JPEG — forwarded to frontend
        perceptualHash: context.perceptualHash || null,
        isVisualMatch: false
      };

      return this.formatResult(true, evidence);
    } catch (err) {
      return this.formatResult(false, {}, err);
    }
  }
}

module.exports = VisualAnalyzer;
