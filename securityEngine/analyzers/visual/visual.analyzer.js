const BaseAnalyzer = require('../../contracts/analyzer.interface');

class VisualAnalyzer extends BaseAnalyzer {
  constructor() {
    super('visual');
  }

  async analyze(context) {
    try {
      // Fact-only extraction for visual layout indicators
      const evidence = {
        hasScreenshot: Boolean(context.screenshotBuffer),
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
