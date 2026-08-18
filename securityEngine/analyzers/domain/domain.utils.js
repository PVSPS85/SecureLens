class DomainUtils {
  /**
   * Parses domain components into subdomains, root domain, and TLD.
   * @param {string} domain 
   */
  static parseComponents(domain) {
    if (!domain || typeof domain !== 'string') return null;

    const parts = domain.toLowerCase().split('.');
    if (parts.length < 2) return null;

    const tld = parts[parts.length - 1];
    const rootDomain = parts.slice(-2).join('.');
    const subdomains = parts.slice(0, -2);

    return {
      subdomains,
      rootDomain,
      tld,
      subdomainCount: subdomains.length,
      hasHighSubdomainDepth: subdomains.length >= 3
    };
  }
}

module.exports = DomainUtils;
