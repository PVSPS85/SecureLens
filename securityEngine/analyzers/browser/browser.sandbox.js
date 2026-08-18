const { chromium } = require('playwright');

class BrowserSandbox {
  /**
   * Launches an isolated, headless Chromium instance with security flags.
   */
  static async createIsolatedContext() {
    const browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-zygote'
      ]
    });

    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) SecureLens-Scanner/1.0',
      ignoreHTTPSErrors: true
    });

    return { browser, context };
  }
}

module.exports = BrowserSandbox;
