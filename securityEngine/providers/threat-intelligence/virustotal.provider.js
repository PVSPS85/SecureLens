const BaseProvider = require('../../contracts/provider.interface');
const https = require('https');

class VirusTotalProvider extends BaseProvider {
  constructor(apiKey) {
    super('virustotal');
    this.apiKey = apiKey;
  }

  async query(domain) {
    if (!this.apiKey) {
      throw new Error('VirusTotal API key missing');
    }

    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'www.virustotal.com',
        path: `/api/v3/domains/${domain}`,
        method: 'GET',
        headers: { 'x-apikey': this.apiKey }
      };

      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', chunk => { body += chunk; });
        res.on('end', () => {
          if (res.statusCode === 200) {
            try {
              const parsed = JSON.parse(body);
              const stats = parsed.data?.attributes?.last_analysis_stats || {};
              resolve({
                malicious: stats.malicious || 0,
                suspicious: stats.suspicious || 0,
                harmless: stats.harmless || 0
              });
            } catch (e) {
              reject(e);
            }
          } else {
            reject(new Error(`VirusTotal API error status: ${res.statusCode}`));
          }
        });
      });

      req.on('error', err => reject(err));
      req.end();
    });
  }
}

module.exports = VirusTotalProvider;
