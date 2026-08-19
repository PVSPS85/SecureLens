const BaseAnalyzer = require('../../contracts/analyzer.interface');
const BrowserSandbox = require('./browser.sandbox');
const ResourceLimits = require('../../security/resource-limits');
const PromptInjectionGuard = require('../../security/prompt-injection.guard');

class BrowserAnalyzer extends BaseAnalyzer {
  constructor() {
    super('browser');
  }

  async analyze(context) {
    const targetUrl = context.type === 'url' ? context.value : `https://${context.value}`;
    let browser, browserContext;

    try {
      const sandbox = await BrowserSandbox.createIsolatedContext();
      browser = sandbox.browser;
      browserContext = sandbox.context;

      const page = await browserContext.newPage();

      await ResourceLimits.withTimeout(
        page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 8000 }),
        10000,
        'Browser DOM Load'
      );

      const pageTitle = await page.title();
      const rawBodyText = await page.innerText('body');
      const sanitizedText = PromptInjectionGuard.sanitizeText(rawBodyText.slice(0, 5000));

      const inputFields = await page.$$eval('input', inputs => inputs.map(i => i.type));
      const hasPasswordField = inputFields.includes('password');

      // Capture a full-page screenshot as a base64 buffer
      let screenshotBase64 = null;
      try {
        const screenshotBuffer = await page.screenshot({
          type: 'jpeg',
          quality: 75,
          fullPage: false,
          clip: { x: 0, y: 0, width: 1280, height: 720 }
        });
        screenshotBase64 = screenshotBuffer.toString('base64');
        // Share with VisualAnalyzer via context
        context.screenshotBuffer = screenshotBase64;
      } catch (ssErr) {
        // Screenshot failed (CSP / blocked) — continue without it
      }

      await browser.close();

      return this.formatResult(true, {
        title: pageTitle,
        hasPasswordField,
        inputCount: inputFields.length,
        bodyTextSnippet: sanitizedText,
        screenshot: screenshotBase64
      });
    } catch (err) {
      if (browser) await browser.close().catch(() => {});
      return this.formatResult(false, {}, err);
    }
  }
}

module.exports = BrowserAnalyzer;
