const dns = require('dns').promises;
const BaseAnalyzer = require('../../contracts/analyzer.interface');

class DNSAnalyzer extends BaseAnalyzer {
  constructor() {
    super('dns');
  }

  async analyze(context) {
    const domain = context.hostname || context.value;
    const records = {};

    try {
      const [a, aaaa, mx, ns, txt] = await Promise.allSettled([
        dns.resolve4(domain),
        dns.resolve6(domain),
        dns.resolveMx(domain),
        dns.resolveNs(domain),
        dns.resolveTxt(domain)
      ]);

      records.a = a.status === 'fulfilled' ? a.value : [];
      records.aaaa = aaaa.status === 'fulfilled' ? aaaa.value : [];
      records.mx = mx.status === 'fulfilled' ? mx.value : [];
      records.ns = ns.status === 'fulfilled' ? ns.value : [];
      records.txt = txt.status === 'fulfilled' ? txt.value.flat() : [];

      const evidence = {
        hasA: records.a.length > 0,
        hasMX: records.mx.length > 0,
        hasNS: records.ns.length > 0,
        records
      };

      return this.formatResult(true, evidence);
    } catch (err) {
      return this.formatResult(false, {}, err);
    }
  }
}

module.exports = DNSAnalyzer;
