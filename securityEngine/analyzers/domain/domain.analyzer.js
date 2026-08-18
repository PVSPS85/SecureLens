const BaseAnalyzer = require('../../contracts/analyzer.interface');
const PunycodeUtils = require('./punycode.utils');

class DomainAnalyzer extends BaseAnalyzer {
  constructor() {
    super('domain');
  }

  async analyze(context) {
    try {
      const host = context.hostname || context.value;
      const parts = host.split('.');

      const isPuny = PunycodeUtils.isPunycode(host);
      const decodedDomain = isPuny ? PunycodeUtils.decodeDomain(host) : host;

      const evidence = {
        hostname: host,
        decodedHostname: decodedDomain,
        isPunycode: isPuny,
        subdomainCount: parts.length > 2 ? parts.length - 2 : 0,
        tld: parts.length > 1 ? parts[parts.length - 1] : null,
        domainLength: host.length
      };

      return this.formatResult(true, evidence);
    } catch (err) {
      return this.formatResult(false, {}, err);
    }
  }
}

module.exports = DomainAnalyzer;
