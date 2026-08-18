const net = require('net');
const BaseAnalyzer = require('../../contracts/analyzer.interface');
const SSRFGuard = require('../../security/ssrf.guard');

class IPASNAnalyzer extends BaseAnalyzer {
  constructor() {
    super('ip-asn');
  }

  async analyze(context) {
    const targetIp = context.type === 'ip' ? context.value : context.resolvedIp;

    if (!targetIp || !net.isIP(targetIp)) {
      return this.formatResult(false, {}, new Error('No valid IP address available for analysis'));
    }

    const isPrivate = SSRFGuard.isPrivateIP(targetIp);

    const evidence = {
      ip: targetIp,
      version: net.isIPv6(targetIp) ? 'v6' : 'v4',
      isPrivate,
      isPublic: !isPrivate
    };

    return this.formatResult(true, evidence);
  }
}

module.exports = IPASNAnalyzer;
