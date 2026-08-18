const https = require('https');
const http = require('http');
const BaseAnalyzer = require('../../contracts/analyzer.interface');
const RedirectGuard = require('../../security/redirect.guard');

class RedirectAnalyzer extends BaseAnalyzer {
  constructor() {
    super('redirects');
    this.redirectGuard = new RedirectGuard(5);
  }

  async analyze(context) {
    const initialUrl = context.type === 'url' ? context.value : `http://${context.value}`;
    const chain = [];
    let currentUrl = initialUrl;

    try {
      for (let hop = 0; hop < 5; hop++) {
        await this.redirectGuard.validateRedirect(currentUrl, hop);

        const res = await this.getHop(currentUrl);
        chain.push({ hop, url: currentUrl, statusCode: res.statusCode });

        if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location) {
          currentUrl = new URL(res.headers.location, currentUrl).href;
        } else {
          break;
        }
      }

      return this.formatResult(true, {
        chain,
        totalHops: chain.length - 1,
        finalUrl: chain[chain.length - 1]?.url || initialUrl,
        hasRedirects: chain.length > 1
      });
    } catch (err) {
      return this.formatResult(false, { chain }, err);
    }
  }

  getHop(urlStr) {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(urlStr);
      const client = urlObj.protocol === 'https:' ? https : http;

      const req = client.request(
        urlObj,
        { method: 'HEAD', timeout: 3000, headers: { 'User-Agent': 'SecureLens-Engine/1.0' } },
        (res) => resolve({ statusCode: res.statusCode, headers: res.headers })
      );

      req.on('timeout', () => { req.destroy(); reject(new Error('Redirect request timeout')); });
      req.on('error', (err) => reject(err));
      req.end();
    });
  }
}

module.exports = RedirectAnalyzer;
