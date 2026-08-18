const BaseProvider = require('../../contracts/provider.interface');
const https = require('https');

class IPInfoProvider extends BaseProvider {
  constructor(token = null) {
    super('ipinfo');
    this.token = token;
  }

  async query(ip) {
    return new Promise((resolve, reject) => {
      const path = this.token ? `/${ip}?token=${this.token}` : `/${ip}/json`;
      const options = {
        hostname: 'ipinfo.io',
        path,
        method: 'GET',
        headers: { 'User-Agent': 'SecureLens-Engine/1.0' }
      };

      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', chunk => { body += chunk; });
        res.on('end', () => {
          if (res.statusCode === 200) {
            try {
              const parsed = JSON.parse(body);
              resolve({
                ip: parsed.ip,
                org: parsed.org || null,
                country: parsed.country || null,
                city: parsed.city || null
              });
            } catch (e) {
              reject(e);
            }
          } else {
            reject(new Error(`IPInfo returned HTTP status ${res.statusCode}`));
          }
        });
      });

      req.on('error', err => reject(err));
      req.end();
    });
  }
}

module.exports = IPInfoProvider;
