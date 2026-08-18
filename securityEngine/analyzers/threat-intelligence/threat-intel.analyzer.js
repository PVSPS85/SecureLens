const BaseAnalyzer = require('../../contracts/analyzer.interface');
const VirusTotalProvider = require('../../providers/threat-intelligence/virustotal.provider');

class ThreatIntelAnalyzer extends BaseAnalyzer {
  constructor(vtApiKey = null) {
    super('threat-intelligence');
    this.vtProvider = vtApiKey ? new VirusTotalProvider(vtApiKey) : null;
  }

  async analyze(context) {
    const domain = context.hostname || context.value;

    if (!this.vtProvider) {
      return this.formatResult(true, { status: 'SKIPPED', reason: 'No API key configured' });
    }

    try {
      const vtResult = await this.vtProvider.query(domain);
      const evidence = {
        isKnownMalicious: vtResult.malicious > 0,
        maliciousCount: vtResult.malicious,
        suspiciousCount: vtResult.suspicious,
        harmlessCount: vtResult.harmless
      };

      return this.formatResult(true, evidence);
    } catch (err) {
      return this.formatResult(false, {}, err);
    }
  }
}

module.exports = ThreatIntelAnalyzer;
