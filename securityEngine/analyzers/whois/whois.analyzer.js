const BaseAnalyzer = require('../../contracts/analyzer.interface');
const whois = require('whois-json');

// In-memory WHOIS cache with TTL (10 minutes)
const whoisCache = new Map();
const CACHE_TTL_MS = 10 * 60 * 1000;

class WhoisAnalyzer extends BaseAnalyzer {
  constructor() {
    super('whois');
  }

  async analyze(context) {
    const domain = context.hostname || context.value;

    // Check memory cache first
    const cached = whoisCache.get(domain);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
      return this.formatResult(true, cached.evidence);
    }

    try {
      // Protect WHOIS query with a strict 3-second timeout so it never hangs scans
      const whoisPromise = whois(domain);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('WHOIS query timeout')), 3000)
      );

      const data = await Promise.race([whoisPromise, timeoutPromise]);
      
      const creationDate = data.creationDate || data.created;
      const ageInDays = creationDate 
        ? Math.floor((Date.now() - new Date(creationDate).getTime()) / (1000 * 60 * 60 * 24))
        : null;

      const evidence = {
        registrar: data.registrar || null,
        createdDate: creationDate || null,
        updatedDate: data.updatedDate || data.updated || null,
        expiresDate: data.expirationDate || data.expires || null,
        domainAgeDays: ageInDays
      };

      // Store in cache
      whoisCache.set(domain, { timestamp: Date.now(), evidence });
      if (whoisCache.size > 2000) {
        const firstKey = whoisCache.keys().next().value;
        whoisCache.delete(firstKey);
      }

      return this.formatResult(true, evidence);
    } catch (err) {
      return this.formatResult(false, {
        registrar: null,
        createdDate: null,
        domainAgeDays: null,
        status: 'UNAVAILABLE'
      }, err);
    }
  }
}

module.exports = WhoisAnalyzer;

