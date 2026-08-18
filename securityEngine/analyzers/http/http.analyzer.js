const http = require('http');
const https = require('https');
const BaseAnalyzer = require('../../contracts/analyzer.interface');
const SSRFGuard = require('../../security/ssrf.guard');

class HTTPAnalyzer extends BaseAnalyzer {
  constructor() {
    super('http');
  }

  async analyze(context) {
    const targetUrl = context.type === 'url' ? context.value : `https://${context.value}`;

    try {
      const parsed = new URL(targetUrl);
      await SSRFGuard.validateDestination(parsed.hostname);

      const response = await this.fetchHeaders(parsed);

      const headers = response.headers;
      const evidence = {
        statusCode: response.statusCode,
        server: headers['server'] || null,
        contentType: headers['content-type'] || null,
        securityHeaders: {
          hasHSTS: Boolean(headers['strict-transport-security']),
          hasCSP: Boolean(headers['content-security-policy']),
          hasXFrameOptions: Boolean(headers['x-frame-options']),
          hasXContentTypeOptions: Boolean(headers['x-content-type-options'])
        }
      };

      return this.formatResult(true, evidence);
    } catch (err) {
      return this.formatResult(false, {}, err);
    }
  }

  fetchHeaders(urlObj) {
    return new Promise((resolve, reject) => {
      const client = urlObj.protocol === 'https:' ? https : http;
      const req = client.request(
        urlObj,
        { method: 'HEAD', timeout: 5000, headers: { 'User-Agent': 'SecureLens-Engine/1.0' } },
        (res) => resolve({ statusCode: res.statusCode, headers: res.headers })
      );

      req.on('timeout', () => { req.destroy(); reject(new Error('HTTP request timed out')); });
      req.on('error', (err) => reject(err));
      req.end();
    });
  }
}

module.exports = HTTPAnalyzer;
