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

      await browser.close();

      return this.formatResult(true, {
        title: pageTitle,
        hasPasswordField,
        inputCount: inputFields.length,
        bodyTextSnippet: sanitizedText
      });
    } catch (err) {
      if (browser) await browser.close().catch(() => {});
      return this.formatResult(false, {}, err);
    }
  }
}

module.exports = BrowserAnalyzer;
