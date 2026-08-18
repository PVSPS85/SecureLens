const BaseProvider = require('../../contracts/provider.interface');
const https = require('https');

class WhoisApiProvider extends BaseProvider {
  constructor(apiKey = null) {
    super('whois-api');
    this.apiKey = apiKey;
  }

  async query(domain) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'whoisjson.com',
        path: `/api/v1/whois?domain=${encodeURIComponent(domain)}`,
        method: 'GET',
        headers: { 
          'User-Agent': 'SecureLens-Engine/1.0',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        }
      };

      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', chunk => { body += chunk; });
        res.on('end', () => {
          if (res.statusCode === 200) {
            try {
              const parsed = JSON.parse(body);
              resolve({
                registrar: parsed.registrar || null,
                creationDate: parsed.created || null,
                expirationDate: parsed.expires || null
              });
            } catch (e) {
              reject(e);
            }
          } else {
            reject(new Error(`WHOIS API returned HTTP status ${res.statusCode}`));
          }
        });
      });

      req.on('error', err => reject(err));
      req.end();
    });
  }
}

module.exports = WhoisApiProvider;
