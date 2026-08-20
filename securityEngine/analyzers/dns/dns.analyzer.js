const dns = require('dns').promises;
const BaseAnalyzer = require('../../contracts/analyzer.interface');

// In-memory DNS cache with TTL (5 minutes)
const dnsCache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000;

class DNSAnalyzer extends BaseAnalyzer {
  constructor() {
    super('dns');
  }

  async analyze(context) {
    const domain = context.hostname || context.value;

    // Check memory cache first
    const cached = dnsCache.get(domain);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
      return this.formatResult(true, cached.evidence);
    }

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

      // Store in cache
      dnsCache.set(domain, { timestamp: Date.now(), evidence });
      // Keep cache bounded
      if (dnsCache.size > 2000) {
        const firstKey = dnsCache.keys().next().value;
        dnsCache.delete(firstKey);
      }

      return this.formatResult(true, evidence);
    } catch (err) {
      return this.formatResult(false, {}, err);
    }
  }
}

module.exports = DNSAnalyzer;

