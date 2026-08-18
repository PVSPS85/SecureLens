const BaseAnalyzer = require('../../contracts/analyzer.interface');
const whois = require('whois-json');

class WhoisAnalyzer extends BaseAnalyzer {
  constructor() {
    super('whois');
  }

  async analyze(context) {
    const domain = context.hostname || context.value;

    try {
      const data = await whois(domain);
      
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

      return this.formatResult(true, evidence);
    } catch (err) {
      return this.formatResult(false, {}, err);
    }
  }
}

module.exports = WhoisAnalyzer;
