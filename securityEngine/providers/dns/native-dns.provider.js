const dns = require('dns').promises;
const BaseProvider = require('../../contracts/provider.interface');

class NativeDNSProvider extends BaseProvider {
  constructor() {
    super('native-dns');
  }

  async query(hostname) {
    const records = {
      a: [],
      aaaa: [],
      mx: [],
      txt: [],
      ns: []
    };

    try {
      records.a = await dns.resolve4(hostname).catch(() => []);
      records.aaaa = await dns.resolve6(hostname).catch(() => []);
      records.mx = await dns.resolveMx(hostname).catch(() => []);
      records.txt = await dns.resolveTxt(hostname).catch(() => []);
      records.ns = await dns.resolveNs(hostname).catch(() => []);

      return {
        hostname,
        records,
        hasIpResolution: records.a.length > 0 || records.aaaa.length > 0
      };
    } catch (err) {
      throw new Error(`Native DNS lookup failed for ${hostname}: ${err.message}`);
    }
  }
}

module.exports = NativeDNSProvider;
